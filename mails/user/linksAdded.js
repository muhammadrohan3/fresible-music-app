module.exports = [
  {
    name: "subject",
    value: "Your Release is now LIVE"
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
    value: "linksAdded.ejs"
  }
];
