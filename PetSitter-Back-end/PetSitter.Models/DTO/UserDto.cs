using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string ProfilePictureUrl { get; set; }
        public int Role { get; set; }
    }
}
