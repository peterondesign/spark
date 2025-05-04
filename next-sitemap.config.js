// next-sitemap.config.js
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dateideas.cc',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dateideas.cc'}/sitemap.xml`,
    ],
  },
  async additionalPaths() {
    // Array to store all dynamic paths
    let allPaths = [];
    
    // Fetch date idea slugs
    try {
      const dateIdeasRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dateideas.cc'}/api/getAllSlugs?type=dateIdeas`);
      const dateIdeas = await dateIdeasRes.json();
      
      const dateIdeaPaths = dateIdeas.map((slug) => ({
        loc: `/date-idea/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
      }));
      
      allPaths = [...allPaths, ...dateIdeaPaths];
    } catch (error) {
      console.error('Error fetching date idea slugs:', error);
    }
    
    // Fetch blog post slugs
    try {
      const blogRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc'}/api/getAllSlugs?type=blog`);
      const blogPosts = await blogRes.json();
      
      const blogPaths = blogPosts.map((slug) => ({
        loc: `/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.7,
      }));
      
      allPaths = [...allPaths, ...blogPaths];
    } catch (error) {
      console.error('Error fetching blog slugs:', error);
    }
    
    // Add any additional dynamic paths as needed
    
    return allPaths;
  },
};

// Change from CommonJS to ES Module export
export default config;