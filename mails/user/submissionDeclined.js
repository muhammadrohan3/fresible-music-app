module.exports = [
  {
    name: "subject",
    value: "Your Release has been Declined"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "user", "firstName"]
      },
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
    value: "submissionDeclined.ejs"
  }
];
