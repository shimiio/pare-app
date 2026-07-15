namespace Pare.Infrastructure.Services;

public static class EmailTemplate
{
    private const string FontStack =
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

    public static string Wrap(string title, string bodyHtml, string footerHtml = "")
    {
        var footer = string.IsNullOrEmpty(footerHtml)
            ? """<p style="margin:0;color:#666;font-size:13px;">— Pare App</p>"""
            : footerHtml;

        return $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="color-scheme" content="dark light">
                <meta name="supported-color-schemes" content="dark light">
            </head>
            <body style="margin:0;padding:0;background-color:#0d0d0d;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;">
                    <tr>
                        <td align="center" style="padding:32px 16px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#161616;border:1px solid #262626;border-radius:12px;overflow:hidden;">
                                <tr>
                                    <td style="padding:28px 28px 8px 28px;font-family:{FontStack};">
                                        <p style="margin:0 0 20px 0;color:#666;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Pare</p>
                                        <h2 style="margin:0 0 20px 0;color:#ffffff;font-size:20px;font-weight:600;">
                                            {title}
                                        </h2>
                                        {bodyHtml}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 28px 28px 28px;font-family:{FontStack};">
                                        {footer}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }
}
