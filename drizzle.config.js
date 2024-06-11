/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://ai-interview-mocker_owner:ri9jeAWwKN8R@ep-summer-sun-a186ti3o.ap-southeast-1.aws.neon.tech/ai-interview-mocker?sslmode=require",
  },
};
