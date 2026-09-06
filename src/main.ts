import './style.css'

type Filter = 'all' | 'active' | 'done'
type Todo = { id: number; title: string; tag: string; done: boolean }

const starterTodos: Todo[] = [
  { id: 1, title: 'Sketch the week ahead', tag: 'Planning', done: false },
  { id: 2, title: 'Reply to the design review', tag: 'Work', done: false },
  { id: 3, title: 'Book a long lunch', tag: 'Personal', done: true },
]

let todos: Todo[] = JSON.parse(localStorage.getItem('focus-list') ?? 'null') ?? starterTodos
let filter: Filter = 'all'

const app = document.querySelector<HTMLDivElement>('#app')!

function icon(name: 'plus' | 'check' | 'trash' | 'sun'): string {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`
}

function render(): void {
  const visible = todos.filter((todo) => filter === 'all' || (filter === 'active' && !todo.done) || (filter === 'done' && todo.done))
  const remaining = todos.filter((todo) => !todo.done).length
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="/"><span class="brand-mark">${icon('check')}</span> focus<span class="brand-dot">.</span></a>
      <div class="header-actions"><span class="date-label">${new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</span><button class="icon-button" aria-label="Toggle theme" title="Toggle theme" id="theme-button">${icon('sun')}</button><span class="avatar">AM</span></div>
    </header>
    <main class="shell">
      <section class="intro"><p class="eyebrow">YOUR DAY, IN VIEW</p><h1>Make space<br><em>for what matters.</em></h1><p class="subtitle">A calm place for the things you want to move forward.</p></section>
      <section class="workspace">
        <div class="list-header"><div><p class="section-kicker">TODAY</p><h2>${remaining} things in motion</h2></div><span class="progress-label">${todos.length - remaining} / ${todos.length} complete</span></div>
        <div class="progress-track"><span style="width: ${todos.length ? ((todos.length - remaining) / todos.length) * 100 : 0}%"></span></div>
        <form class="add-form" id="add-form"><input id="new-todo" autocomplete="off" placeholder="What needs your attention?" aria-label="New task" maxlength="80"><button type="submit">${icon('plus')} Add task</button></form>
        <div class="filters" role="tablist" aria-label="Task filters">${(['all', 'active', 'done'] as Filter[]).map((item) => `<button class="filter ${filter === item ? 'selected' : ''}" data-filter="${item}" role="tab" aria-selected="${filter === item}">${item === 'all' ? 'Everything' : item === 'active' ? 'In progress' : 'Completed'} <span>${item === 'all' ? todos.length : item === 'active' ? remaining : todos.length - remaining}</span></button>`).join('')}</div>
        <div class="todo-list">${visible.length ? visible.map(todoTemplate).join('') : '<div class="empty-state"><span>02</span><p>Nothing here yet.<br><strong>Enjoy the clear space.</strong></p></div>'}</div>
      </section>
      <footer><span>FOCUS LIST <b>•</b> ${new Date().getFullYear()}</span><span>Small steps count.</span></footer>
    </main>`
  bindEvents()
}

function todoTemplate(todo: Todo): string {
  return `<article class="todo ${todo.done ? 'is-done' : ''}"><button class="check-button" data-toggle="${todo.id}" aria-label="Mark ${todo.done ? 'incomplete' : 'complete'}: ${todo.title}">${todo.done ? icon('check') : ''}</button><div class="todo-copy"><p>${todo.title}</p><span>${todo.tag}</span></div><button class="delete-button" data-delete="${todo.id}" aria-label="Delete ${todo.title}" title="Delete task">${icon('trash')}</button></article>`
}

function bindEvents(): void {
  document.querySelector<HTMLFormElement>('#add-form')!.addEventListener('submit', (event) => {
    event.preventDefault()
    const input = document.querySelector<HTMLInputElement>('#new-todo')!
    const title = input.value.trim()
    if (!title) return
    todos = [{ id: Date.now(), title, tag: 'Inbox', done: false }, ...todos]
    persist(); render()
  })
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter as Filter; render() }))
  document.querySelectorAll<HTMLElement>('[data-toggle]').forEach((button) => button.addEventListener('click', () => { const todo = todos.find((item) => item.id === Number(button.dataset.toggle)); if (todo) todo.done = !todo.done; persist(); render() }))
  document.querySelectorAll<HTMLElement>('[data-delete]').forEach((button) => button.addEventListener('click', () => { todos = todos.filter((item) => item.id !== Number(button.dataset.delete)); persist(); render() }))
  document.querySelector<HTMLButtonElement>('#theme-button')!.addEventListener('click', () => document.body.classList.toggle('warm'))
}

function persist(): void { localStorage.setItem('focus-list', JSON.stringify(todos)) }

render()
