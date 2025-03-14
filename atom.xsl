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
        <link rel="stylesheet" href="/new.css"/>
        <style type="text/css">
          body {
            max-width: 768px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          h1 {
            margin-bottom: 1rem;
          }
          
          .alert {
            background:#fff5b1;
            padding:4px 12px;
            margin-bottom: 2rem;
          }
          
          .entry {
            margin-bottom: 2rem;
          }
          
          .entry h2 {
            margin-bottom: 0;
            display: inline-block;
            font-family: 'DINdong', sans-serif !important;
          }

          .entry time {
            font-style: italic;
            margin-left: 1rem;
          }
          
          .entry p {
            margin: 0.5rem 0;
          }
        </style>
      </head>
      <body>
        <header>
          <a href="/index.html">← Max Bo</a>
          <h1><xsl:value-of select="atom:feed/atom:title"/></h1>
          <div class="alert">
            <p>This is an <a href="https://andrewstiefel.com/style-atom-xsl/">XLST-styled Atom feed</a>. 
            Subscribe by copying the URL from the address bar into your <a href="https://www.theverge.com/24036427/rss-feed-reader-best">RSS/Atom reader</a>.</p>
          </div>
        </header>
        <section>
          <xsl:apply-templates select="atom:feed/atom:entry" />
        </section>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="atom:feed">
  </xsl:template>

  <xsl:template match="atom:entry">
    <div class="entry">
      <div>
        <h2>
          <a target="_blank">
            <xsl:attribute name="href">
              <xsl:value-of select="atom:id"/>
            </xsl:attribute>
            <xsl:value-of select="atom:title"/>
          </a>
        </h2>
        <time>
          <xsl:attribute name="datetime">
            <xsl:value-of select="atom:updated"/>
          </xsl:attribute>
          <xsl:call-template name="format-date">
            <xsl:with-param name="date" select="atom:updated"/>
          </xsl:call-template>
        </time>
      </div>
      <p>
        <xsl:value-of select="atom:summary" disable-output-escaping="yes" />
      </p>
    </div>
  </xsl:template>

  <xsl:template name="format-date">
    <xsl:param name="date"/>
    <xsl:variable name="year" select="substring($date, 1, 4)"/>
    <xsl:variable name="month" select="substring($date, 6, 2)"/>
    <xsl:variable name="day" select="substring($date, 9, 2)"/>
    
    <xsl:choose>
      <xsl:when test="$month = '01'">January</xsl:when>
      <xsl:when test="$month = '02'">February</xsl:when>
      <xsl:when test="$month = '03'">March</xsl:when>
      <xsl:when test="$month = '04'">April</xsl:when>
      <xsl:when test="$month = '05'">May</xsl:when>
      <xsl:when test="$month = '06'">June</xsl:when>
      <xsl:when test="$month = '07'">July</xsl:when>
      <xsl:when test="$month = '08'">August</xsl:when>
      <xsl:when test="$month = '09'">September</xsl:when>
      <xsl:when test="$month = '10'">October</xsl:when>
      <xsl:when test="$month = '11'">November</xsl:when>
      <xsl:when test="$month = '12'">December</xsl:when>
    </xsl:choose>
    <xsl:text> </xsl:text>
    <xsl:value-of select="number($day)"/>
    <xsl:text>, </xsl:text>
    <xsl:value-of select="$year"/>
  </xsl:template>

</xsl:stylesheet>
