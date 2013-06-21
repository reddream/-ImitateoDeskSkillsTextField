using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;

namespace WebSample
{
    /// <summary>
    /// data 的摘要说明
    /// </summary>
    public class Data : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/json";
            string jsonFilePath = context.Server.MapPath("json.txt");
            string jsonStr = File.ReadAllText(jsonFilePath);
            context.Response.Write(jsonStr);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}