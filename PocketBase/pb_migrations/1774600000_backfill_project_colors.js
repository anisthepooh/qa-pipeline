migrate((app) => {
  const records = app.findRecordsByFilter("projects", "1=1", "+created", 0, 0)

  records.forEach((record, index) => {
    record.set("color", index % 5)
    app.save(record)
  })
}, (app) => {
  const records = app.findRecordsByFilter("projects", "1=1", "+created", 0, 0)

  records.forEach((record) => {
    record.set("color", 0)
    app.save(record)
  })
})
