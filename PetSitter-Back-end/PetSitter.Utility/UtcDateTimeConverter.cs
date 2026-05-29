using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Utility
{
    public class UtcDateTimeConverter : IsoDateTimeConverter
    {
        public UtcDateTimeConverter()
        {
            // Định dạng chuẩn ISO 8601, "o" sẽ tự động thêm chữ 'Z'
            DateTimeFormat = "o";
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is DateTime dateTime)
            {
                // đảm bảo Kind = Utc
                var utc = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                base.WriteJson(writer, utc, serializer);
            }
            else
            {
                base.WriteJson(writer, value, serializer);
            }
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var date = base.ReadJson(reader, objectType, existingValue, serializer);
            if (date is DateTime dateTime)
            {
                return dateTime.ToUniversalTime();
            }
            return date;
        }
    }
}
