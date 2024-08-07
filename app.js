const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db
const app = express()
app.use(express.json())
const intialalizer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('successful http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Eroor ${e.message}`)
    process.exit(1)
  }
}

intialalizer()

const convertObj = eachObject => {
  return {
    id: eachObject.id,
    todo: eachObject.todo,
    priority: eachObject.priority,
    category: eachObject.category,
    status: eachObject.status,
    dueDate: eachObject.due_date,
  }
}

const hasStatus = statusObj => {
  return statusObj.status !== undefined
}
const hasPriority = statusObj => {
  return statusObj.priority !== undefined
}
const hasCategory = statusObj => {
  return statusObj.category !== undefined
}
const hasPriorityStatus = statusObj => {
  return statusObj.status !== undefined && statusObj.priority !== undefined
}
const hasSearchq = statusObj => {
  return statusObj.search_q !== undefined
}
const hasCategoryStatus = statusObj => {
  return statusObj.category !== undefined && statusObj.status !== undefined
}
const hasCategoryPriority = statusObj => {
  return statusObj.category !== undefined && statusObj.priority !== undefined
}

//API1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodoQuery = ''
  const {search_q = '', status, priority, category} = request.query
  switch (true) {
    case hasStatus(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodoQuery = `SELECT * FROM todo
          WHERE status = "${status}";`
        data = await db.all(getTodoQuery)
        response.send(data.map(eachObject => convertObj(eachObject)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasPriority(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodoQuery = `SELECT * FROM
        todo WHERE priority = "${priority}";`
        data = await db.all(getTodoQuery)
        response.send(data.map(eachObject => convertObj(eachObject)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategory(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodoQuery = `SELECT * FROM
        todo WHERE category = "${category}";`
        data = await db.all(getTodoQuery)
        response.send(data.map(eachObject => convertObj(eachObject)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityStatus(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `
          SELECT * FROM todo
          WHERE priority = "${priority}" AND status = "${status}";`
          data = await db.all(getTodoQuery)
          response.send(data.map(eachObject => convertObj(eachObject)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryStatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `
        SELECT * FROM todo
        WHERE category = "${category}" AND status = "${status}";`
          data = await db.all(getTodoQuery)
          response.send(data.map(eachObject => convertObj(eachObject)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodoQuery = `
        SELECT * FROM todo
        WHERE category = "${category}" AND priority = "${priority}";`
          data = await db.all(getTodoQuery)
          response.send(data.map(eachObject => convertObj(eachObject)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasSearchq(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`
      data = await db.all(getTodoQuery)
      response.send(data.map(eachObject => convertObj(eachObject)))
      break
    default:
      getTodoQuery = `SELECT * FROM todo;`
      data = await db.all(getTodoQuery)
      response.send(data.map(eachObject => convertObj(eachObject)))
      break
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getOneTodo = `SELECT * FROM todo WHERE id = ${todoId};`
  const getOneTodoResult = await db.get(getOneTodo)
  response.send(convertObj(getOneTodoResult))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  if (isMatch(date, 'yyyy-MM-dd')) {
    const neDate = format(new Date(date), 'yyyy-MM-dd')
    const dateQuery = `SELECT * FROM todo WHERE due_date = "${neDate}";`
    const dateResult = await db.all(dateQuery)
    response.send(dateResult.map(eachObject => convertObj(eachObject)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const insertDataQuery = `INSERT INTO todo (id, todo, category, priority, status, due_date)
          VALUES (${id}, "${todo}", "${category}", "${priority}", "${status}", "${newDate}");`
          await db.run(insertDataQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getRowToUpdate = `SELECT * FROM todo WHERE id = ${todoId};`
  const getRowToResult = await db.get(getRowToUpdate)
  const {
    todo = getRowToResult.todo,
    priority = getRowToResult.priority,
    status = getRowToResult.status,
    category = getRowToResult.category,
    dueDate = getRowToResult.due_date,
  } = request.body
  let updateTodoQuery
  switch (true) {
    case request.body.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        updateTodoQuery = `UPDATE todo SET
        id = ${todoId}, todo = "${todo}", priority = "${priority}", status = "${status}", category = "${category}", due_date = "${dueDate}"
        WHERE id = ${todoId};`
        await db.run(updateTodoQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case request.body.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updateTodoQuery = `UPDATE todo SET
        id = ${todoId}, todo = "${todo}", priority = "${priority}", status = "${status}", category = "${category}", due_date = "${dueDate}"
        WHERE id = ${todoId};`
        await db.run(updateTodoQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case request.body.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET
          id = ${todoId}, todo = "${todo}", priority = "${priority}", status = "${status}", category = "${category}", due_date = "${dueDate}"
          WHERE id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send('Todo Updated')
      break
    case request.body.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodoQuery = `UPDATE todo SET
          id = ${todoId}, todo = "${todo}", priority = "${priority}", status = "${status}", category = "${category}", due_date = "${dueDate}"
          WHERE id = ${todoId};`
        await db.run(updateTodoQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case request.body.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        updateTodoQuery = `UPDATE todo SET
          id = ${todoId}, todo = "${todo}", priority = "${priority}", status = "${status}", category = "${category}", due_date = "${dueDate}"
          WHERE id = ${todoId};`
        await db.run(updateTodoQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
