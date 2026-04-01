import { createClient } from '@supabase/supabase-js'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    const url = new URL(request.url)
    const pathname = url.pathname

    // GET /api/stats - 论坛统计数据
    if (pathname === '/api/stats' && request.method === 'GET') {
      const [{ count: postCount }, { count: userCount }] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ])
      return jsonResponse({ postCount, userCount })
    }

    // GET /api/posts - 获取帖子列表（管理用）
    if (pathname === '/api/posts' && request.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') ?? '1')
      const pageSize = 20
      const from = (page - 1) * pageSize
      const { data, error, count } = await supabase
        .from('posts')
        .select('*, author:profiles(id, username)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1)
      if (error) return jsonResponse({ error: error.message }, 500)
      return jsonResponse({ data, total: count, page, pageSize })
    }

    // DELETE /api/posts/:id - 删除帖子（管理员操作）
    const deletePostMatch = pathname.match(/^\/api\/posts\/([\w-]+)$/)
    if (deletePostMatch && request.method === 'DELETE') {
      const postId = deletePostMatch[1]
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) return jsonResponse({ error: error.message }, 500)
      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: 'Not Found' }, 404)
  },
}
