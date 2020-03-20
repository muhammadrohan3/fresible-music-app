module.exports = [
  {
    name: "subject",
    value: "Your Role has been Changed"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "firstName"]
      },
      {
        name: "role",
        value: ["schemaResult", "role"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "email"]
  },
  {
    name: "template",
    value: "roleChanged.ejs"
  }
];
