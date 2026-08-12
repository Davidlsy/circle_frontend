import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  // 第三方登录回调页（B1 配套：后端授权后会重定向到此路径；
  // 不设 guest/auth 元信息，登录/注册/绑定三种流程都需要可达）
  { path: '/oauth/callback/:provider', name: 'OauthCallback', component: () => import('@/views/OauthCallbackView.vue') },
  { path: '/', component: () => import('@/views/LayoutView.vue'), children: [
    // 游客可访问的公开路由
    { path: '', name: 'Home', component: () => import('@/views/HomeView.vue') },
    { path: 'stars', name: 'Stars', component: () => import('@/views/StarsView.vue') },
    { path: 'stars/:id', name: 'StarDetail', component: () => import('@/views/StarDetailView.vue') },
    { path: 'fan-circles', name: 'FanCircles', component: () => import('@/views/FanCirclesView.vue') },
    { path: 'fan-circles/:id', name: 'FanCircleDetail', component: () => import('@/views/FanCircleDetailView.vue') },
    { path: 'posts/:id', name: 'PostDetail', component: () => import('@/views/PostDetailView.vue') },
    // 受保护路由（必须登录）
    { path: 'messages', name: 'Messages', component: () => import('@/views/MessagesView.vue'), meta: { auth: true } },
    { path: 'groups', name: 'Groups', component: () => import('@/views/GroupsView.vue'), meta: { auth: true } },
    { path: 'groups/:id', name: 'GroupChat', component: () => import('@/views/GroupChatView.vue'), meta: { auth: true } },
    { path: 'profile/:id?', name: 'Profile', component: () => import('@/views/ProfileView.vue'), meta: { auth: true } },
    // 发帖页（R3：原先 CreatePostView 已存在但未注册路由，导致发帖入口不可达）
    { path: 'create-post', name: 'CreatePost', component: () => import('@/views/CreatePostView.vue'), meta: { auth: true } },
  ]},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 受保护路由：未登录重定向到登录页，并携带 redirect 回跳参数
  if (to.meta.auth && !token) return next({ path: '/login', query: { redirect: to.fullPath } })
  // 已登录用户禁止访问登录/注册页
  if (to.meta.guest && token) return next('/')
  next()
})

export default router
