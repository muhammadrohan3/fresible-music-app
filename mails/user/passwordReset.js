module.exports = [
  {
    name: "subject",
    value: "Password Reset Instructions"
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
    value: ["schemaResult", "email"]
  },
  {
    name: "template",
    value: "passwordReset.ejs"
  }
];
