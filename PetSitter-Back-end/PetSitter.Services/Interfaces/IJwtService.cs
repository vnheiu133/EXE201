using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Services.Interfaces
{
	public interface IJwtService
	{
		string GenerateToken(string email, Guid userId);
		ClaimsPrincipal? ValidateToken(string token);

    }
}
