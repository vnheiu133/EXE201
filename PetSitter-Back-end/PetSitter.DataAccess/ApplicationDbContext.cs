using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetSitter.Models.Models;

namespace PetSitter.DataAccess;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Blogs> Blogs { get; set; }
    public DbSet<Brands> Brands { get; set; }
    public DbSet<Categories> Categories { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Orders> Orders { get; set; }
    public DbSet<Products> Products { get; set; }
    public DbSet<ProductReview> Reviews { get; set; }
    public DbSet<Services> Services { get; set; }
    public DbSet<Shops> Shops { get; set; }
    public DbSet<BlogTags> BlogTags { get; set; }
    public DbSet<Bookings> Bookings { get; set; }
    public DbSet<Pets> Pets { get; set; }
    public DbSet<ProductTags> ProductTags { get; set; }
    public DbSet<ServiceTags> ServiceTags { get; set; }
    public DbSet<Users> Users { get; set; }
    public DbSet<ServiceReview> ServiceReviews { get; set; }
    public DbSet<BlogLikes> BlogLikes { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blogs>().HasKey(x => x.BlogId);
        modelBuilder.Entity<Brands>().HasKey(x => x.BrandId);
        modelBuilder.Entity<Categories>().HasKey(x => x.CategoryId);
        modelBuilder.Entity<OrderItem>().HasKey(x => x.OrderItemId);
        modelBuilder.Entity<Orders>().HasKey(x => x.OrderId);
        modelBuilder.Entity<Products>().HasKey(x => x.ProductId);
        modelBuilder.Entity<ProductReview>().HasKey(x => x.ReviewId);
        modelBuilder.Entity<Services>().HasKey(x => x.ServiceId);
        modelBuilder.Entity<Shops>().HasKey(x => x.ShopId);
        modelBuilder.Entity<BlogTags>().HasKey(x => x.BlogTagId);
        modelBuilder.Entity<ProductTags>().HasKey(x => x.ProductTagId);
        modelBuilder.Entity<Bookings>().HasKey(x => x.BookingId);
        modelBuilder.Entity<Pets>().HasKey(x => x.PetId);
        modelBuilder.Entity<Users>().HasKey(x => x.UserId);
        modelBuilder.Entity<ServiceTags>().HasKey(x => x.ServiceTagId);
        modelBuilder.Entity<ServiceReview>().HasKey(x => x.ReviewId);
        modelBuilder.Entity<BlogLikes>().HasKey(x => x.BlogLikeId);
        modelBuilder.Entity<Wishlist>().HasKey(x => x.WishlistId);
        modelBuilder.Entity<Conversation>().HasKey(c => c.ConversationId);
        modelBuilder.Entity<Message>().HasKey(m => m.MessageId);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.PetOwner)
            .WithMany() 
            .HasForeignKey(c => c.PetOwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.Shop)
            .WithMany() 
            .HasForeignKey(c => c.ShopId)
            .OnDelete(DeleteBehavior.Restrict);
        //* Relationships
        modelBuilder.Entity<Users>()
            .HasOne(x => x.Shop)
            .WithOne(x => x.User)
            .HasForeignKey<Shops>(x => x.UserId);

        modelBuilder.Entity<Blogs>()
            .HasOne(x => x.Author)
            .WithMany(x => x.Blogs)
            .HasForeignKey(x => x.AuthorId);
            
        modelBuilder.Entity<Users>()
            .HasMany(x => x.Reviews)
            .WithOne(x => x.Users)
            .HasForeignKey(x => x.UserId);
        
        modelBuilder.Entity<Users>()
            .HasMany(x => x.Orders)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId);
        
        modelBuilder.Entity<Shops>()
            .HasMany(x => x.Products)
            .WithOne(x => x.Shop)
            .HasForeignKey(x => x.ShopId);
        
        modelBuilder.Entity<Shops>()
            .HasMany(x => x.Services)
            .WithOne(x => x.Shop)
            .HasForeignKey(x => x.ShopId);
        
        modelBuilder.Entity<Products>()
            .HasMany(x => x.Reviews)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId)
            .IsRequired(false);
        
        modelBuilder.Entity<Categories>()
            .HasMany(x => x.Products)
            .WithOne(x => x.Category)
            .HasForeignKey(x => x.CategoryId);
        
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Product)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Brands>()
            .HasMany(x => x.Products)
            .WithOne(x => x.Brand)
            .HasForeignKey(x => x.BrandId);
        
        modelBuilder.Entity<Users>()
            .HasMany(x => x.Pets)
            .WithOne(x => x.Owner)
            .HasForeignKey(x => x.OwnerId);
        
        modelBuilder.Entity<Bookings>()
            .HasOne(x => x.Customer)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bookings>()
            .HasOne(x => x.Pet)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bookings>()
            .HasOne(x => x.Service)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Products>()
            .HasOne(x => x.Tags)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.TagId);

        modelBuilder.Entity<Blogs>()
            .HasOne(x => x.BlogTag)
            .WithMany(x => x.Blogs)
            .HasForeignKey(x => x.TagId);
        
        modelBuilder.Entity<Services>()
            .HasOne(x => x.ServiceTags)
            .WithMany(x => x.Service)
            .HasForeignKey(x => x.TagId);
        
        modelBuilder.Entity<Blogs>()
            .HasOne(x => x.Categories)
            .WithMany(x => x.Blogs)
            .HasForeignKey(x => x.CategoryId);
        
        modelBuilder.Entity<ServiceReview>()
            .HasOne(x => x.Users)
            .WithMany(x => x.ServiceReviews)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<ServiceReview>()
            .HasOne(x => x.Service)
            .WithMany(x => x.ServiceReviews)
            .HasForeignKey(x => x.ServiceId);

        modelBuilder.Entity<BlogLikes>()
            .HasOne(x => x.Users)
            .WithMany(x => x.BlogLikes)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<BlogLikes>()
            .HasOne(x => x.Blogs)
            .WithMany(x => x.BlogLikes)
            .HasForeignKey(x => x.BlogId);
        
        modelBuilder.Entity<Wishlist>()
            .HasOne(x => x.User)
            .WithMany(x => x.Wishlists)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Wishlist>()
            .HasOne(x => x.Product)
            .WithMany(x => x.Wishlists)
            .HasForeignKey(x => x.ProductId);
    }
}