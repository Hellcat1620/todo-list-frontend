
const toDo = {
  tasksListActive: document.getElementById('task-list_active'),
  tasksListEnd: document.getElementById('task-list_end'),
  inputNewTask: document.getElementById('new-task_input'),
  btnNewTask: document.getElementById('new-task_btn'),
  tasksList: document.getElementById('tasks-list'),
};

const serverUrl = 'http://178.57.220.116:4444/'

const currentDateSpan = document.getElementById('info_date')
const currentTimeSpan = document.getElementById('info_time')

taskRender();

// Вывод текущей даты и времени

setInterval(() => {
  currentDateSpan.innerHTML = new Date().toLocaleDateString()
  currentTimeSpan.innerHTML = new Date().toLocaleTimeString()
}, 1000)


// Клик по кнопке добавления задачи

toDo.btnNewTask.onclick = async () => {
  const newTaskText = toDo.inputNewTask.value;
  if(newTaskText) {
    await addTask(newTaskText)
    toDo.inputNewTask.value = ''
    taskRender()
  }
}
// Клик по кнопкам задачи

toDo.tasksList.onclick = async function (event) {
  const target = event.target
  const isComplete = target.classList.contains('task-item_btn__complet')
  const isDelete = target.classList.contains('task-item_btn__del')
  const isUpdate = target.classList.contains('task-item_btn__edit')


  if (isComplete) {
    const task = target.parentElement
    const taskId = task.getAttribute("id")
    await changeTaskStatus(taskId)
    taskRender()
  }

  if (isDelete) {
    const task = target.parentElement.parentElement
    const taskId = task.getAttribute("id")
    await deleteTask(taskId)
    taskRender()
  }

  if (isUpdate) {
    const task = target.parentElement.parentElement
    const taskId = task.getAttribute("id")
    console.log(task)
    const updateInput = document.getElementById('update-task_input')
    const updateBtn = document.getElementById('update-task_btn')
    updateBtn.onclick = async () => {
      if(updateInput.value) {
        await changeTaskText(taskId, updateInput.value)
        taskRender()
      }
    }
  }  
}

// Добавление новой задачи

async function addTask(text) {
  const task = {
    text,
    isComplete: false
  }
  await fetch(`${serverUrl}task-list/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(task)
  }).catch(err => console.log(err))
}

// Функция генерации HTML задачи

function taskRender() {
  fetch(`${serverUrl}task-list/`)
    .then(res => res.json())
    .then(resBody => {
      let htmlListActive = ''
      let htmlListEnd = ''
      resBody.forEach((task) => {
        if (task.isComplete == false) {
          const taskHtml = `
            <li id="${task._id}" class="task-item task-item_active">
              <button class="task-item_btn__complet">
                <svg class="icon_task-item">
                  <use xlink:href="img/sprite.svg#check"></use>
                </svg>
              </button>
              <p class="task-item_text">${task.text}</p>
              <div class="btn_block">
                <button class="task-item_btn__edit _modal-open" data-modal-open="update-task">
                  <svg class="icon_task-item">
                    <use xlink:href="img/sprite.svg#edit"></use>
                  </svg>
                </button>
                <button class="task-item_btn__del">
                  <svg class="icon_task-item">
                    <use xlink:href="img/sprite.svg#delete"></use>
                  </svg>
                </button>
              </div>
            </li>
          `
          htmlListActive = htmlListActive + taskHtml
        } else {
          const taskHtml = `
          <li id="${task._id}" class="task-item task-item_end">
            <button class="task-item_btn__complet">
              <svg class="icon_task-item">
                <use xlink:href="img/sprite.svg#check"></use>
              </svg>
            </button>
            ${task.text}
          </li>
          `
          htmlListEnd = htmlListEnd + taskHtml
        }
      })
      toDo.tasksListActive.innerHTML = htmlListActive
      toDo.tasksListEnd.innerHTML = htmlListEnd

      const modalBtns = document.querySelectorAll('._modal-open');
      const modals = document.querySelectorAll('.modal');

      modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          let data = e.target.dataset.modalOpen
      
          modals.forEach(modal => {
            if (modal.dataset.modal == data || modal.dataset.modal == e.target.closest('._modal-open').dataset.modalOpen) {
              openModal(modal)
            }
          })
        })
      })
      
      modals.forEach(modal => {
        modal.addEventListener('click', e => closeModal(e))
      })
    }).catch(err => console.log(err))
}

// Функция изменения статуса задачи

async function changeTaskStatus(id) {
  await fetch(`${serverUrl}task-list/${id}`, {
    method: 'PATCH',
  }).catch(err => console.log(err))
}

// Функция изменения задачи 

async function changeTaskText(id, text) {
  console.log('changeTaskText' , id, text)
  await fetch(`${serverUrl}task-list/update/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ text })
  }).catch(err => console.log(err))
}

// Функция удаления задачи

async function deleteTask(id) {
  await fetch(`${serverUrl}task-list/${id}`, {
    method: 'DELETE',
  }).catch(err => console.log(err))
}




// Модальные окна

function openModal(elem) {
  elem.classList.add('_active');
}

function closeModal(e) {
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close') || e.target.classList.contains('modal_overlay')) {
    e.target.closest('.modal').classList.remove('_active');
  }
}
