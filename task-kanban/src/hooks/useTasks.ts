import { useReducer, useEffect } from 'react'
import type { Task, TaskStatus, Priority, Assignee, TagName } from '../types'

const STORAGE_KEY = 'task-kanban-tasks'
const SEEDED_KEY = 'task-kanban-seeded'

type TaskAction =
  | { type: 'ADD_TASK'; payload: { title: string; description: string; priority: Priority; dueDate?: string; assignee?: Assignee; tags?: TagName[] } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'DELETE_TASK'; payload: { id: string } }

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          title: action.payload.title,
          description: action.payload.description,
          status: 'todo' as TaskStatus,
          priority: action.payload.priority,
          createdAt: Date.now(),
          dueDate: action.payload.dueDate,
          assignee: action.payload.assignee,
          tags: action.payload.tags,
        },
      ]
    case 'UPDATE_TASK':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates }
          : task
      )
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload.id)
    default:
      return state
  }
}

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const raw = JSON.parse(data) as Task[]
      return raw.map((t) => ({
        ...t,
        priority: (['high', 'medium', 'low'].includes(t.priority)
          ? t.priority
          : 'medium') as Priority,
      }))
    }
  } catch {
    // fall through to seed
  }
  if (localStorage.getItem(SEEDED_KEY)) return []
  localStorage.setItem(SEEDED_KEY, '1')
  const now = Date.now()
  return [
    {
      id: 'seed-1',
      title: '用户注册流程优化',
      description: '## 需求分析\n\n简化注册步骤，从 **5步** 减至 **3步**，提升转化率。\n\n### 设计要点\n\n- 减少必填字段\n- 支持手机号快捷注册\n- 社交账号一键登录\n\n### 子任务\n\n- [x] 设计新流程图\n- [x] 前端表单重构\n- [ ] 后端 API 调整\n- [ ] E2E 测试\n- [ ] 灰度发布',
      status: 'in-progress' as TaskStatus,
      priority: 'high' as Priority,
      createdAt: now - 3 * 86400000,
      subtasks: [
        { id: 's1-0', text: '设计新流程图', done: true },
        { id: 's1-1', text: '前端表单重构', done: true },
        { id: 's1-2', text: '后端 API 调整', done: false },
        { id: 's1-3', text: 'E2E 测试', done: false },
        { id: 's1-4', text: '灰度发布', done: false },
      ],
      comments: [
        { id: 'c1-0', author: '小明', content: '流程图已确认，和产品对齐了', createdAt: now - 2 * 86400000 },
        { id: 'c1-1', author: '小红', content: '前端部分已完成，提了 PR #42', createdAt: now - 86400000 },
        { id: 'c1-2', author: '小明', content: '后端接口文档更新了吗？', createdAt: now - 3600000 },
      ],
      attachments: [],
      dueDate: new Date(now + 2 * 86400000).toISOString().slice(0, 10),
      assignee: { id: 'a1', name: '张三', initial: '张', color: 'pink' },
      tags: ['优化', '开发'],
    },
    {
      id: 'seed-2',
      title: 'Dashboard 数据看板设计',
      description: '## 概述\n\n为运营团队设计实时数据看板。\n\n### 核心指标\n\n1. DAU / MAU\n2. 留存率\n3. 转化漏斗\n4. 收入趋势\n\n### 技术选型\n\n使用 `ECharts` 搭建，支持 `WebSocket` 实时推送。\n\n### 子任务\n\n- [x] 确定指标定义\n- [x] UI 线框图\n- [ ] 前端开发\n- [ ] 接口联调',
      status: 'todo' as TaskStatus,
      priority: 'medium' as Priority,
      createdAt: now - 5 * 86400000,
      subtasks: [
        { id: 's2-0', text: '确定指标定义', done: true },
        { id: 's2-1', text: 'UI 线框图', done: true },
        { id: 's2-2', text: '前端开发', done: false },
        { id: 's2-3', text: '接口联调', done: false },
      ],
      comments: [
        { id: 'c2-0', author: '产品经理', content: '本周五前需要完成线框图评审', createdAt: now - 4 * 86400000 },
      ],
      attachments: [],
      dueDate: new Date(now + 5 * 86400000).toISOString().slice(0, 10),
      assignee: { id: 'a3', name: '王五', initial: '王', color: 'green' },
      tags: ['设计'],
    },
    {
      id: 'seed-3',
      title: '修复 iOS Safari 布局错位',
      description: '## 问题描述\n\n在 iOS Safari 上，底部导航栏与页面内容重叠。\n\n### 复现步骤\n\n1. 打开首页\n2. 滚动到底部\n3. 底部导航栏遮挡最后一条数据\n\n### 原因分析\n\nSafari 的 `100vh` 包含了地址栏高度，需要使用 `dvh` 单位。\n\n### 子任务\n\n- [x] 定位问题根因\n- [x] 修复 CSS\n- [x] 多设备测试',
      status: 'done' as TaskStatus,
      priority: 'high' as Priority,
      createdAt: now - 7 * 86400000,
      subtasks: [
        { id: 's3-0', text: '定位问题根因', done: true },
        { id: 's3-1', text: '修复 CSS', done: true },
        { id: 's3-2', text: '多设备测试', done: true },
      ],
      comments: [
        { id: 'c3-0', author: 'QA', content: '已在 iPhone 13/14/15 上验证通过', createdAt: now - 6 * 86400000 },
        { id: 'c3-1', author: '小红', content: '👍 修复干净利落', createdAt: now - 5 * 86400000 },
      ],
      attachments: [],
      dueDate: new Date(now - 1 * 86400000).toISOString().slice(0, 10),
      assignee: { id: 'a2', name: '李四', initial: '李', color: 'blue' },
      tags: ['开发'],
    },
    {
      id: 'seed-4',
      title: '接入第三方支付（微信/支付宝）',
      description: '## 目标\n\n支持微信支付和支付宝两种支付方式。\n\n### 子任务\n\n- [ ] 申请商户号\n- [ ] 后端签名服务\n- [ ] 前端 SDK 集成\n- [ ] 沙箱环境测试\n- [ ] 生产环境上线',
      status: 'todo' as TaskStatus,
      priority: 'high' as Priority,
      createdAt: now - 86400000,
      subtasks: [
        { id: 's4-0', text: '申请商户号', done: false },
        { id: 's4-1', text: '后端签名服务', done: false },
        { id: 's4-2', text: '前端 SDK 集成', done: false },
        { id: 's4-3', text: '沙箱环境测试', done: false },
        { id: 's4-4', text: '生产环境上线', done: false },
      ],
      comments: [],
      attachments: [],
      dueDate: new Date(now + 7 * 86400000).toISOString().slice(0, 10),
      assignee: { id: 'a1', name: '张三', initial: '张', color: 'pink' },
      tags: ['紧急', '开发'],
    },
    {
      id: 'seed-5',
      title: '编写 API 文档',
      description: '## 范围\n\n为 v2 版本的所有 REST API 编写 OpenAPI 3.0 文档。\n\n### 子任务\n\n- [x] 用户模块\n- [ ] 订单模块\n- [ ] 支付模块',
      status: 'in-progress' as TaskStatus,
      priority: 'low' as Priority,
      createdAt: now - 2 * 86400000,
      subtasks: [
        { id: 's5-0', text: '用户模块', done: true },
        { id: 's5-1', text: '订单模块', done: false },
        { id: 's5-2', text: '支付模块', done: false },
      ],
      comments: [
        { id: 'c5-0', author: '小明', content: '用户模块文档已提交，请 review', createdAt: now - 86400000 },
      ],
      attachments: [],
      dueDate: new Date(now + 3 * 86400000).toISOString().slice(0, 10),
      assignee: { id: 'a4', name: '赵六', initial: '赵', color: 'purple' },
      tags: ['功能'],
    },
  ]
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Storage full or unavailable — degrade gracefully
  }
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(taskReducer, [], loadTasks)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = (payload: { title: string; description: string; priority: Priority; dueDate?: string; assignee?: Assignee; tags?: TagName[] }) => {
    dispatch({ type: 'ADD_TASK', payload })
  }

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } })
  }

  return { tasks, addTask, updateTask, deleteTask }
}
