using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Xml;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using System.Configuration;

namespace WebSample
{
    /// <summary>
    /// QueryServices 的摘要说明
    /// </summary>
    public class QueryServices : IHttpHandler
    {
        private readonly static XmlDocument xmlDoc;

        public static bool IsGettingFromWebService
        {
            get 
            {
                return ConfigurationManager.AppSettings["isgettingfromwebservice"] == "1";
            }
        }


        static QueryServices()
        {
            string contentXml=string.Empty;
            if (IsGettingFromWebService) 
            {
                WebClient webClient = new WebClient();
                Byte[] pageData = webClient.DownloadData(url);
                contentXml = Encoding.Default.GetString(pageData);
            }
            else
            {
               string filename = HttpContext.Current.Server.MapPath("skills.xml");
               contentXml = File.ReadAllText(filename);
            }

            xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(contentXml);
        }

        public QueryServices() 
        {

        }

        //	<response><server_time>1371550894</server_time><skills><skill>1shoppingcart</skill>
        //	<skill>2d-animation</skill><skill>2d-design</skill><skill>3d-animation</skill><skill>3d-design</skill>
        //	<skill>3d-modeling</skill>
        //	<skill>3d-printing</skill><skill>3d-rendering</skill><skill>3d-rigging</skill>
        private static string url = "http://www.odesk.com/api/profiles/v1/metadata/skills.xml";
        public void ProcessRequest(HttpContext context)
        {
            string query = context.Request.Params["query"];
            string xpath = string.Format("//skill[contains(text(),'{0}')]", query);
            XmlNodeList nodelist = xmlDoc.SelectNodes(xpath);
            JavaScriptSerializer jsonSerializer = new JavaScriptSerializer();
            SuggestionInformation si = new SuggestionInformation();
            si.query = query;
            if (nodelist != null)
            {
                foreach (XmlNode node in nodelist)
                {
                    si.suggestions.Add(node.InnerText);
                }
            }
            string jsonStr=jsonSerializer.Serialize(si);
            context.Response.ContentType = "text/json";
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