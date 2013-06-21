<%@ Page Title="HomePage" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeBehind="Default.aspx.cs" Inherits="WebSample._Default" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <script type="text/javascript">
        $(document).ready(function () {
            using(['tooltip', 'messager'], function () {
                $.filterskills.init({ wg: "jsBabelSkillsWidget", className: "topicCriteria", sk: "myskills", url: "QueryServices.ashx" });
             });
        });
    </script>
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <table>
        <tr>
            <td>
                <h3>
                    Imitate oDesk Skills TextField (Search Contractors Page)</h3>
            </td>
        </tr>
        <tr>
            <td>
                You could put your skills here:<br />
                <div id="jsBabelSkillsWidget" class="oTagsField" style="width: 210px;">
                    <input type="text" id="myskills" class="ac_input" maxlength="100" />
                    <input type="hidden" class="topicCriteria" id="skills" name="search" />
                </div>
            </td>
        </tr>
    </table>
</asp:Content>
