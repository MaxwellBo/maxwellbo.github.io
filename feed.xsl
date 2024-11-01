<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="atom"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <title><xsl:value-of select="atom:feed/atom:title"/></title>
        <style type="text/css">
          body{
            max-width:768px;
            margin:0 auto;
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size:16px;
            line-height:1.5em}
            
            section{
              margin:30px 15px
            }
            
            h1 {
              font-size:2em;
              margin:.67em 0;
              line-height:1.125em;
              border-bottom:1px solid #eaecef;
            }
            
            .alert {
              background:#fff5b1;
              padding:4px 12px;
              margin:0 -12px
            }
            
            .entry h3 {
              margin-bottom:0
            }
            .entry p {
              margin:4px 0
            }
        </style>
      </head>
      <body>
        <section>
          <div class="alert">
            <p>This is an <a href="https://andrewstiefel.com/style-atom-xsl/">XLST-styled Atom feed</a>. 
            Subscribe by copying the URL from the address bar into your <a href="https://www.theverge.com/24036427/rss-feed-reader-best">RSS/Atom reader</a>.</p>
          </div>
        </section>
        <section>
          <xsl:apply-templates select="atom:feed" />
        </section>
        <section>
          <xsl:apply-templates select="atom:feed/atom:entry" />
        </section>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="atom:feed">
    <a href="/index.html">← Max Bo</a>
    <h1><xsl:value-of select="atom:title"/></h1>
  </xsl:template>

  <xsl:template match="atom:entry">
    <div class="entry">
      <h3>
        <a target="_blank">
          <xsl:attribute name="href">
            <xsl:value-of select="atom:id"/>
          </xsl:attribute>
          <xsl:value-of select="atom:title"/>
        </a>
      </h3>
      <p>
        <xsl:value-of select="atom:summary"  disable-output-escaping="yes" />
      </p>
      <small>
        <xsl:value-of select="atom:updated" />
      </small>
    </div>
  </xsl:template>

</xsl:stylesheet>
