using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess;
using PetSitter.Models.Enums;
using PetSitter.Models.Models;
using System.Security.Claims;

namespace PetSitter.WebApi.Controller;

[Route("api/[controller]")]
[ApiController]
public class BookingController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookingController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class CreateBookingRequest
    {
        public Guid ServiceId { get; set; }
        public DateTime BookingDate { get; set; }
        public string? Note { get; set; }
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var customerId))
        {
            return Unauthorized(new { message = "Không xác thực được người dùng." });
        }

        var service = await _context.Services.FindAsync(request.ServiceId);
        if (service == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ." });
        }

        if (request.BookingDate <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "Lịch đặt dịch vụ phải ở thời gian tương lai." });
        }

        // Tự động tìm hoặc tạo thú cưng mặc định cho khách hàng này
        var pet = await _context.Pets.FirstOrDefaultAsync(p => p.OwnerId == customerId);
        if (pet == null)
        {
            pet = new Pets
            {
                PetId = Guid.NewGuid(),
                OwnerId = customerId,
                PetName = "Thú cưng của tôi",
                PetType = "Chó",
                Breed = "Lai",
                BirthDate = DateTime.UtcNow.AddYears(-1),
                CreatedAt = DateTime.UtcNow
            };
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();
        }

        var booking = new Bookings
        {
            BookingId = Guid.NewGuid(),
            CustomerId = customerId,
            ServiceId = request.ServiceId,
            PetId = pet.PetId,
            BookingDate = request.BookingDate,
            Status = BookingStatus.Pending,
            TotalPrice = service.PricePerPerson,
            Note = request.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Đặt lịch dịch vụ thành công.",
            booking = new
            {
                booking.BookingId,
                booking.BookingDate,
                booking.Status,
                booking.TotalPrice,
                booking.Note,
                serviceName = service.ServiceName
            }
        });
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var customerId))
        {
            return Unauthorized(new { message = "Không xác thực được người dùng." });
        }

        var bookings = await _context.Bookings
            .Include(b => b.Service)
                .ThenInclude(s => s.Shop)
            .Include(b => b.Pet)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.BookingId,
                b.BookingDate,
                b.Status,
                b.TotalPrice,
                b.Note,
                b.CreatedAt,
                service = new
                {
                    b.Service.ServiceId,
                    b.Service.ServiceName,
                    b.Service.ServiceImageUrl,
                    b.Service.Description,
                    shop = new
                    {
                        b.Service.Shop.ShopId,
                        b.Service.Shop.ShopName,
                        b.Service.Shop.ShopImageUrl
                    }
                },
                pet = new
                {
                    b.Pet.PetId,
                    b.Pet.PetName,
                    b.Pet.PetType
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }
}
