module.exports = [
  {
    name: "subject",
    value: "Your Release has been Deleted"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "user", "firstName"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "user", "email"]
  },
  {
    name: "template",
    value: "submissionDeleted.ejs"
  }
];
