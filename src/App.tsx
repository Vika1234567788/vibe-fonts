import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import './App.css'

type TaskStatus = 'todo' | 'done'

type TaskCategory = 'Morning' | 'After School' | 'Chores' | 'Bonus'

interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  reward: number
  status: TaskStatus
  assignedKidId: string
  dueLabel: string
  timeOfDay: string
  icon: string
  createdAt: string
  completedAt?: string
}

interface Kid {
  id: string
  name: string
  age: number
  icon: string
  favoriteColor: string
  focus: string
  badges: string[]
  points: number
  streak: number
}

interface TrackerState {
  kids: Kid[]
  tasks: Task[]
}

const STORAGE_KEY = 'kids-task-tracker-v1'

const categoryIcon: Record<TaskCategory, string> = {
  Morning: '🌅',
  'After School': '🎒',
  Chores: '🧹',
  Bonus: '⭐',
}

const filterOptions = [
  { id: 'today', label: 'Today', hint: 'Active missions' },
  { id: 'completed', label: 'High fives', hint: 'Finished tasks' },
  { id: 'bonus', label: 'Bonus boosts', hint: 'Extra rewards' },
] as const

type FilterId = (typeof filterOptions)[number]['id']

const defaultKids: Kid[] = [
  {
    id: 'luna',
    name: 'Luna',
    age: 9,
    icon: '🦊',
    favoriteColor: '#7c8dff',
    focus: 'Morning hero',
    badges: ['Early Bird', 'Laundry Star'],
    points: 45,
    streak: 6,
  },
  {
    id: 'milo',
    name: 'Milo',
    age: 7,
    icon: '🐻',
    favoriteColor: '#ffb973',
    focus: 'After-school ace',
    badges: ['Homework Pro', 'Snack Helper'],
    points: 38,
    streak: 4,
  },
  {
    id: 'nova',
    name: 'Nova',
    age: 11,
    icon: '🐯',
    favoriteColor: '#53e0c0',
    focus: 'Bedtime boss',
    badges: ['Plant Whisperer', 'Reading Rocket'],
    points: 52,
    streak: 8,
  },
]

const defaultTasks: Task[] = [
  {
    id: 'task-bed',
    title: 'Make your bed',
    description: 'Smooth the sheets, fluff the pillows, and line up plushies.',
    category: 'Morning',
    reward: 5,
    status: 'todo',
    assignedKidId: 'luna',
    dueLabel: 'Before breakfast',
    timeOfDay: 'Sunrise',
    icon: '🛏️',
    createdAt: '2024-05-01T08:00:00.000Z',
  },
  {
    id: 'task-pet',
    title: 'Feed Pixel the cat',
    description: 'Scoop 1 cup of food and refresh the water dish.',
    category: 'Morning',
    reward: 7,
    status: 'done',
    assignedKidId: 'luna',
    dueLabel: '7:15 am sharp',
    timeOfDay: 'Sunrise',
    icon: '🐱',
    createdAt: '2024-05-01T07:50:00.000Z',
    completedAt: '2024-05-01T07:52:00.000Z',
  },
  {
    id: 'task-pack',
    title: 'Pack homework folder',
    description: 'Check the planner and tuck finished sheets inside.',
    category: 'After School',
    reward: 6,
    status: 'todo',
    assignedKidId: 'milo',
    dueLabel: 'Before dinner',
    timeOfDay: 'Afternoon',
    icon: '📚',
    createdAt: '2024-05-01T18:00:00.000Z',
  },
  {
    id: 'task-snack',
    title: 'Prep fruit snack bowls',
    description: 'Rinse berries and split them into two small bowls.',
    category: 'Chores',
    reward: 4,
    status: 'todo',
    assignedKidId: 'milo',
    dueLabel: 'After homework',
    timeOfDay: 'Afternoon',
    icon: '🍓',
    createdAt: '2024-05-01T18:05:00.000Z',
  },
  {
    id: 'task-plants',
    title: 'Water the plant wall',
    description: 'Give each plant 1 squeeze bottle and mist the mint leaves.',
    category: 'Chores',
    reward: 8,
    status: 'todo',
    assignedKidId: 'nova',
    dueLabel: 'Before sunset',
    timeOfDay: 'Evening',
    icon: '🪴',
    createdAt: '2024-05-01T17:00:00.000Z',
  },
  {
    id: 'task-reading',
    title: 'Read for 20 minutes',
    description: 'Pick a graphic novel and curl up on the beanbag.',
    category: 'After School',
    reward: 9,
    status: 'done',
    assignedKidId: 'nova',
    dueLabel: '7:30 pm lights-out',
    timeOfDay: 'Evening',
    icon: '📖',
    createdAt: '2024-05-01T19:00:00.000Z',
    completedAt: '2024-05-01T19:25:00.000Z',
  },
  {
    id: 'task-kindness',
    title: 'Kindness high-five',
    description: 'Leave a sticky note compliment for someone in the house.',
    category: 'Bonus',
    reward: 10,
    status: 'todo',
    assignedKidId: 'milo',
    dueLabel: 'Anytime today',
    timeOfDay: 'All day',
    icon: '💌',
    createdAt: '2024-05-01T12:00:00.000Z',
  },
  {
    id: 'task-art',
    title: 'Sort the art shelf',
    description: 'Snap markers closed and recycle dry ones.',
    category: 'Bonus',
    reward: 7,
    status: 'todo',
    assignedKidId: 'luna',
    dueLabel: 'Weekend bonus',
    timeOfDay: 'Weekend',
    icon: '🎨',
    createdAt: '2024-05-01T16:00:00.000Z',
  },
]

const getStoredState = (): TrackerState | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as TrackerState
    if (Array.isArray(parsed.kids) && Array.isArray(parsed.tasks)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Math.random().toString(36).slice(2, 9)}`
}

function App() {
  const storedState = useMemo(() => getStoredState(), [])
  const [kids, setKids] = useState<Kid[]>(storedState?.kids ?? defaultKids)
  const [tasks, setTasks] = useState<Task[]>(storedState?.tasks ?? defaultTasks)
  const [filter, setFilter] = useState<FilterId>('today')
  const [draftTask, setDraftTask] = useState(() => ({
    title: '',
    description: '',
    category: 'Morning' as TaskCategory,
    reward: 5,
    assignedKidId: storedState?.kids?.[0]?.id ?? defaultKids[0]?.id ?? '',
    dueLabel: 'Before school',
    timeOfDay: 'Sunrise',
  }))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        kids,
        tasks,
      }),
    )
  }, [kids, tasks])

  useEffect(() => {
    if (!kids.length) {
      setDraftTask((prev) => ({ ...prev, assignedKidId: '' }))
      return
    }
    if (!kids.some((kid) => kid.id === draftTask.assignedKidId)) {
      setDraftTask((prev) => ({ ...prev, assignedKidId: kids[0].id }))
    }
  }, [kids, draftTask.assignedKidId])

  const kidLookup = useMemo(() => {
    const map = new Map<string, Kid>()
    kids.forEach((kid) => map.set(kid.id, kid))
    return map
  }, [kids])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === 'done').length
    const totalPoints = kids.reduce((sum, kid) => sum + kid.points, 0)
    const highestStreak = kids.reduce((max, kid) => Math.max(max, kid.streak), 0)
    return {
      total,
      completed,
      remaining: Math.max(0, total - completed),
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      totalPoints,
      highestStreak,
    }
  }, [kids, tasks])

  const filterCounts = useMemo<Record<FilterId, number>>(
    () => ({
      today: tasks.filter((task) => task.status !== 'done').length,
      completed: tasks.filter((task) => task.status === 'done').length,
      bonus: tasks.filter((task) => task.category === 'Bonus').length,
    }),
    [tasks],
  )

  const leaderboard = useMemo(
    () => [...kids].sort((a, b) => b.points - a.points),
    [kids],
  )
  const leaderId = leaderboard[0]?.id

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed':
        return tasks.filter((task) => task.status === 'done')
      case 'bonus':
        return tasks.filter((task) => task.category === 'Bonus')
      default:
        return tasks.filter((task) => task.status !== 'done')
    }
  }, [tasks, filter])

  const upcoming = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'done')
        .sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .slice(0, 3),
    [tasks],
  )

  const handleToggleTask = (taskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId)
    if (!targetTask) {
      return
    }
    const nextStatus: TaskStatus = targetTask.status === 'done' ? 'todo' : 'done'

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )

    setKids((prev) =>
      prev.map((kid) => {
        if (kid.id !== targetTask.assignedKidId) {
          return kid
        }
        const pointsDelta = nextStatus === 'done' ? targetTask.reward : -targetTask.reward
        const streakDelta = nextStatus === 'done' ? 1 : -1
        return {
          ...kid,
          points: Math.max(0, kid.points + pointsDelta),
          streak: Math.max(0, kid.streak + streakDelta),
        }
      }),
    )
  }

  const handleCreateTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draftTask.title.trim() || !draftTask.assignedKidId) {
      return
    }

    const newTask: Task = {
      id: generateId(),
      title: draftTask.title.trim(),
      description: draftTask.description.trim() || 'Custom mission from HQ',
      category: draftTask.category,
      reward: Math.max(1, draftTask.reward),
      status: 'todo',
      assignedKidId: draftTask.assignedKidId,
      dueLabel: draftTask.dueLabel,
      timeOfDay: draftTask.timeOfDay,
      icon: categoryIcon[draftTask.category],
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setDraftTask((prev) => ({
      ...prev,
      title: '',
      description: '',
    }))
    setFilter('today')
  }

  const showCelebration = filter === 'today' && filteredTasks.length === 0

  return (
    <div className="app-shell">
      <header className="panel hero">
        <div className="hero__copy">
          <p className="eyebrow">Kid mission control</p>
          <h1>Build joyful routines together</h1>
          <p className="lead">
            Turn daily chores into colorful quests. Track progress, celebrate wins, and
            unlock bonus boosts for extra effort.
          </p>
          <div className="hero__tags">
            <span className="tag-pill">Gamified chores</span>
            <span className="tag-pill">Positive rewards</span>
            <span className="tag-pill">Daily rhythm</span>
          </div>
        </div>
        <div className="hero__stats">
          <article className="stat-card">
            <p className="stat-card__label">Missions left</p>
            <p className="stat-card__value">{stats.remaining}</p>
            <span className="stat-card__hint">{stats.progress}% complete</span>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">High-five streak</p>
            <p className="stat-card__value">{stats.highestStreak} days</p>
            <span className="stat-card__hint">Best run so far</span>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Points bank</p>
            <p className="stat-card__value">{stats.totalPoints}</p>
            <span className="stat-card__hint">Total earned</span>
          </article>
        </div>
        <div className="hero__upcoming panel">
          <div>
            <p className="eyebrow">Next up</p>
            <h2>Coach the next 3 wins</h2>
          </div>
          <ul className="upcoming-list">
            {upcoming.map((task) => {
              const kid = kidLookup.get(task.assignedKidId)
              return (
                <li key={task.id}>
                  <span className="upcoming-list__icon">{task.icon}</span>
                  <div>
                    <p className="upcoming-list__title">{task.title}</p>
                    <p className="upcoming-list__meta">
                      {kid?.name ?? 'Kiddo'} · {task.dueLabel}
                    </p>
                  </div>
                  <span className="reward-chip">+{task.reward} pts</span>
                </li>
              )
            })}
            {!upcoming.length && (
              <li className="upcoming-list__empty">
                All missions completed — time for a dance party!
              </li>
            )}
          </ul>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel kid-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Crew lineup</p>
              <h2>Kid dashboard</h2>
            </div>
            <p className="panel__hint">{kids.length} helpers</p>
          </div>
          <div className="kid-grid">
            {kids.map((kid) => {
              const kidTasks = tasks.filter((task) => task.assignedKidId === kid.id)
              const completed = kidTasks.filter((task) => task.status === 'done').length
              const remaining = Math.max(0, kidTasks.length - completed)
              const progress = kidTasks.length
                ? Math.round((completed / kidTasks.length) * 100)
                : 0
              const nextMission = kidTasks.find((task) => task.status !== 'done')
              const level = Math.max(1, Math.floor(kid.points / 25) + 1)
              const style = {
                '--kid-color': kid.favoriteColor,
              } as CSSProperties

              return (
                <article
                  key={kid.id}
                  className={`kid-card ${leaderId === kid.id ? 'kid-card--leader' : ''}`}
                  style={style}
                >
                  <div className="kid-card__header">
                    <span className="kid-card__avatar" aria-hidden>
                      {kid.icon}
                    </span>
                    <div>
                      <p className="kid-card__name">
                        {kid.name}
                        <span> · {kid.age}</span>
                      </p>
                      <p className="kid-card__focus">{kid.focus}</p>
                    </div>
                    <span className="kid-card__level">Level {level}</span>
                  </div>
                  <div className="kid-card__progress">
                    <div className="kid-card__progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="kid-card__stats">
                    <div>
                      <p>{kid.points}</p>
                      <span>points</span>
                    </div>
                    <div>
                      <p>{kid.streak}</p>
                      <span>day streak</span>
                    </div>
                    <div>
                      <p>{remaining}</p>
                      <span>left today</span>
                    </div>
                  </div>
                  <ul className="kid-card__badges">
                    {kid.badges.map((badge) => (
                      <li key={badge}>{badge}</li>
                    ))}
                  </ul>
                  <p className="kid-card__next">
                    {nextMission
                      ? `Next up: ${nextMission.title}`
                      : 'All missions done — cue the confetti!'}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="panel tasks-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Mission board</p>
              <h2>Today’s tasks</h2>
            </div>
            <div className="task-filters" role="tablist" aria-label="Task filters">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === option.id}
                  className={`task-filter${filter === option.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(option.id)}
                >
                  <div>
                    <span>{option.label}</span>
                    <small>{option.hint}</small>
                  </div>
                  <span className="pill pill--count">{filterCounts[option.id]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.map((task) => {
              const kid = kidLookup.get(task.assignedKidId)
              return (
                <article
                  key={task.id}
                  className={`task-card ${task.status === 'done' ? 'is-complete' : ''}`}
                >
                  <div className="task-card__icon" aria-hidden>
                    {task.icon}
                  </div>
                  <div className="task-card__body">
                    <div className="task-card__title-row">
                      <h3>{task.title}</h3>
                      <span className={`task-card__category cat-${task.category.replace(' ', '-').toLowerCase()}`}>
                        {task.category}
                      </span>
                    </div>
                    <p className="task-card__description">{task.description}</p>
                    <div className="task-card__meta">
                      <span>{kid?.name ?? 'Kiddo'}</span>
                      <span>{task.dueLabel}</span>
                      <span className="reward-chip">+{task.reward} pts</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="task-card__action"
                    onClick={() => handleToggleTask(task.id)}
                  >
                    {task.status === 'done' ? 'Undo' : 'Complete'}
                  </button>
                </article>
              )
            })}

            {showCelebration && (
              <div className="empty-state">
                <h3>Everything is wrapped!</h3>
                <p>Switch to bonus boosts to keep the momentum going.</p>
                <button type="button" onClick={() => setFilter('bonus')}>
                  View bonus missions
                </button>
              </div>
            )}

            {!filteredTasks.length && !showCelebration && (
              <div className="empty-state">
                <h3>No tasks here yet</h3>
                <p>Create a new mission or pick a different filter.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Mission builder</p>
              <h2>Create a new task</h2>
            </div>
            <p className="panel__hint">Keep it short and fun!</p>
          </div>

          <form className="task-form" onSubmit={handleCreateTask}>
            <div className="form-grid">
              <label className="form-field">
                Task name
                <input
                  name="title"
                  type="text"
                  placeholder="Feed the puppy..."
                  value={draftTask.title}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="form-field">
                Assigned kid
                <select
                  name="assignedKidId"
                  value={draftTask.assignedKidId}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, assignedKidId: event.target.value }))
                  }
                  required
                >
                  {kids.map((kid) => (
                    <option key={kid.id} value={kid.id}>
                      {kid.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field form-field--full">
                Details
                <textarea
                  name="description"
                  placeholder="Add a playful reminder or special steps."
                  rows={3}
                  value={draftTask.description}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <label className="form-field">
                Category
                <select
                  name="category"
                  value={draftTask.category}
                  onChange={(event) =>
                    setDraftTask((prev) => ({
                      ...prev,
                      category: event.target.value as TaskCategory,
                    }))
                  }
                >
                  {Object.keys(categoryIcon).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                Reward points
                <input
                  name="reward"
                  type="number"
                  min={1}
                  max={50}
                  value={draftTask.reward}
                  onChange={(event) =>
                    setDraftTask((prev) => ({
                      ...prev,
                      reward: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="form-field">
                Due reminder
                <input
                  name="dueLabel"
                  type="text"
                  value={draftTask.dueLabel}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, dueLabel: event.target.value }))
                  }
                  placeholder="Before piano practice"
                />
              </label>
              <label className="form-field">
                Time of day
                <input
                  name="timeOfDay"
                  type="text"
                  value={draftTask.timeOfDay}
                  onChange={(event) =>
                    setDraftTask((prev) => ({ ...prev, timeOfDay: event.target.value }))
                  }
                  placeholder="Afternoon"
                />
              </label>
            </div>
            <div className="form-actions">
              <div>
                <p className="eyebrow">Preview</p>
                <p className="form-preview">
                  {draftTask.title ? draftTask.title : 'Give your mission a name'} · +
                  {draftTask.reward} pts
                </p>
              </div>
              <button type="submit">Add mission</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
