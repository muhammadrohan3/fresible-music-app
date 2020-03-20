module.exports = [
  {
    name: "subject",
    value: "Your Password was Changed"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "firstName"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "email"]
  },
  {
    name: "template",
    value: "passwordChanged.ejs"
  }
];
