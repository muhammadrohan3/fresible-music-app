module.exports = [
  {
    name: "subject",
    value: "Verify Your Email"
  },
  {
    name: "variables",
    children: [
      {
        name: "url",
        value: ["url"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "user", "email"]
  },
  {
    name: "template",
    value: "submissionApproved.ejs"
  }
];
