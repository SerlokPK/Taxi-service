using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class RegistrationController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage PostUser([FromBody] Musterija k)
        {
            var msg = Request.CreateResponse(HttpStatusCode.Created, k);
            msg.Headers.Location = new Uri(Request.RequestUri + k.Username);

            string CS = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=C:\Users\Serlok\source\repos\TaxiSluzba\WP-PR138-2015\WebAPI\App_Data\Database1.mdf;Integrated Security=True";

            using (SqlConnection con = new SqlConnection(CS))
            {
                con.Open();
                SqlCommand cmd;

                string query = $"INSERT INTO [Korisnici](Id, ime) VALUES(5, '{k.Name}')";

                cmd = new SqlCommand(query, con);
                cmd.ExecuteNonQuery();

            }




            return msg;
        }
    }
}
