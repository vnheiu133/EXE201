using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Utility.Utils
{
    public static class GeoUtils
    {
        public static double GetDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // km
            double dLat = ToRad(lat2 - lat1);
            double dLon = ToRad(lon2 - lon1);
            lat1 = ToRad(lat1);
            lat2 = ToRad(lat2);

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2) * Math.Cos(lat1) * Math.Cos(lat2);
            double c = 2 * Math.Asin(Math.Sqrt(a));
            return R * c;
        }

        public static double ToRad(double deg) => deg * Math.PI / 180.0;

        // parse "lat,lon" -> (lat, lon) or null
        public static (double lat, double lon)? ParseLatLon(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            var parts = s.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (parts.Length < 2) return null;
            if (double.TryParse(parts[0], out var lat) && double.TryParse(parts[1], out var lon))
                return (lat, lon);
            return null;
        }
    }
}
