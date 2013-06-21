using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebSample
{
    [Serializable]
    public class SuggestionInformation
    {
        public SuggestionInformation()
        {
            suggestions = new List<string>();
            data = new List<string>();
        }

        public string query { get; set; }
        public List<string> suggestions { get; set; }
        public List<string> data { get; set; }
    }
}