// This is the local API client that replaces the Supabase client
// It communicates with your local Express backend instead of Supabase

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

interface Session {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class LocalAPIClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token');
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth methods
  auth = {
    signUp: async (email: string, password: string, name: string) => {
      const response = await this.request('POST', '/auth/register', {
        email,
        password,
        name,
      });
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
      }
      return { data: { user: response.user }, error: null };
    },

    signInWithPassword: async (email: string, password: string) => {
      const response = await this.request('POST', '/auth/login', {
        email,
        password,
      });
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
      }
      return { data: { user: response.user, session: { access_token: response.token } }, error: null };
    },

    signOut: async () => {
      this.token = null;
      localStorage.removeItem('auth_token');
      return { error: null };
    },

    getSession: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: { session: null }, error: null };
      }
      this.token = token;
      // Verify token is still valid
      try {
        const user = await this.request('GET', '/auth/me');
        return {
          data: {
            session: {
              user,
              access_token: token,
            },
          },
          error: null,
        };
      } catch {
        localStorage.removeItem('auth_token');
        return { data: { session: null }, error: null };
      }
    },

    getUser: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: { user: null }, error: null };
      }
      this.token = token;
      try {
        const user = await this.request('GET', '/auth/me');
        return { data: { user }, error: null };
      } catch {
        localStorage.removeItem('auth_token');
        return { data: { user: null }, error: null };
      }
    },

    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      // Listen for token changes
      window.addEventListener('storage', async () => {
        const token = localStorage.getItem('auth_token');
        if (token !== this.token) {
          this.token = token;
          if (token) {
            try {
              const user = await this.request('GET', '/auth/me');
              callback('SIGNED_IN', { user, access_token: token });
            } catch {
              callback('SIGNED_OUT', null);
            }
          } else {
            callback('SIGNED_OUT', null);
          }
        }
      });

      return { unsubscribe: () => {} };
    },
  };

  // Roles methods
  roles = {
    checkRole: async () => {
      try {
        const data = await this.request('GET', '/roles/check');
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    assignStudent: async () => {
      try {
        const data = await this.request('POST', '/roles/student');
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    assignTeacher: async (schoolCode?: string) => {
      try {
        const data = await this.request('POST', '/roles/teacher', schoolCode ? { schoolCode } : undefined);
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    assignDeveloper: async () => {
      try {
        const data = await this.request('POST', '/roles/developer');
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  };

  // Database methods - keeping Supabase-like interface for compatibility
  from = (table: string) => {
    return {
      select: (columns = '*') => {
        const baseQuery = {
          filters: [] as Array<{ column: string; operator: string; value: unknown }>,
          orderBy: null as { column: string; ascending: boolean } | null,
          limitCount: null as number | null,
          addFilter: (column: string, operator: string, value: unknown) => {
            baseQuery.filters.push({ column, operator, value });
            return baseQuery;
          },
          eq: (column: string, value: unknown) => baseQuery.addFilter(column, 'eq', value),
          neq: (column: string, value: unknown) => baseQuery.addFilter(column, 'neq', value),
          in: (column: string, value: unknown[]) => baseQuery.addFilter(column, 'in', value),
          filter: (column: string, operator: string, value: unknown) => baseQuery.addFilter(column, operator, value),
          or: (orFilter: string) => {
            // Parse or filter like "expires_at.is.null,expires_at.gt.2024-01-01"
            baseQuery.filters.push({ column: '_or', operator: 'or', value: orFilter });
            return baseQuery;
          },
          gt: (column: string, value: unknown) => baseQuery.addFilter(column, 'gt', value),
          gte: (column: string, value: unknown) => baseQuery.addFilter(column, 'gte', value),
          lt: (column: string, value: unknown) => baseQuery.addFilter(column, 'lt', value),
          lte: (column: string, value: unknown) => baseQuery.addFilter(column, 'lte', value),
          is: (column: string, value: unknown) => baseQuery.addFilter(column, 'is', value),
          order: (column: string, options?: { ascending: boolean }) => {
            baseQuery.orderBy = { column, ascending: options?.ascending ?? false };
            return baseQuery;
          },
          limit: (count: number) => {
            baseQuery.limitCount = count;
            return baseQuery;
          },
          single: async () => {
            try {
              const data = await this.executeQuery(table, columns, baseQuery.filters, baseQuery.orderBy, baseQuery.limitCount);
              return { data: data[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          maybeSingle: async () => {
            try {
              const data = await this.executeQuery(table, columns, baseQuery.filters, baseQuery.orderBy, baseQuery.limitCount);
              return { data: data[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          then: (onResolve: (result: any) => void, onReject?: (error: any) => void) => {
            this.executeQuery(table, columns, baseQuery.filters, baseQuery.orderBy, baseQuery.limitCount)
              .then(data => onResolve({ data, error: null }))
              .catch(error => onReject?.({ data: null, error }));
            return Promise.resolve();
          },
        };
        return baseQuery;
      },
      insert: (insertData: unknown) => {
        const insertPromise = new Promise((resolve, reject) => {
          (async () => {
            try {
              const result = await this.request('POST', `/db/${table}`, insertData);
              resolve({ data: Array.isArray(result) ? result : [result], error: null });
            } catch (error) {
              reject({ data: null, error });
            }
          })();
        });

        return {
          select: (columns = '*') => ({
            single: () => new Promise((resolve, reject) => {
              insertPromise
                .then((res: any) => resolve({ data: res.data[0] || null, error: res.error }))
                .catch(reject);
            }),
            then: (onResolve: any, onReject?: any) => insertPromise.then(onResolve, onReject),
          }),
          then: (onResolve: any, onReject?: any) => insertPromise.then(onResolve, onReject),
        };
      },
      update: (updateData: unknown) => ({
        eq: (column: string, value: unknown) => {
          const executeUpdate = async () => {
            try {
              const result = await this.request('PATCH', `/db/${table}?${column}=eq:${value}`, updateData);
              return { data: Array.isArray(result) ? result : [result], error: null };
            } catch (error) {
              return { data: null, error };
            }
          };

          return {
            select: (columns = '*') => ({
              single: async () => {
                const res = await executeUpdate();
                return { data: res.data?.[0] || null, error: res.error };
              },
              then: async (onResolve: any, onReject?: any) => {
                const res = await executeUpdate();
                if (res.error && onReject) {
                  onReject(res);
                } else {
                  onResolve(res);
                }
              },
            }),
            then: async (onResolve: any, onReject?: any) => {
              const res = await executeUpdate();
              onResolve(res);
            },
          };
        },
      }),
      delete: () => {
        const deleteFilters: Array<{ column: string; value: unknown }> = [];
        
        const buildDeleteQuery = () => {
          const filterString = deleteFilters.map(f => `${f.column}=eq:${f.value}`).join('&');
          return this.request('DELETE', `/db/${table}?${filterString}`)
            .then(result => ({ data: result, error: null }))
            .catch(error => ({ data: null, error }));
        };
        
        const deleteChain: any = {
          eq: (column: string, value: unknown) => {
            deleteFilters.push({ column, value });
            return deleteChain;
          },
          then: async (onResolve: any, onReject?: any) => {
            try {
              const res = await buildDeleteQuery();
              onResolve(res);
            } catch (error) {
              if (onReject) onReject(error);
            }
          },
        };
        
        return deleteChain;
      },
    };
  };

  private async executeQuery(
    table: string,
    columns: string,
    filters: Array<{ column: string; operator: string; value: unknown }>,
    orderBy?: { column: string; ascending: boolean } | null,
    limitCount?: number | null
  ) {
    let endpoint = `/db/${table}?columns=${columns}`;
    for (const filter of filters) {
      if (filter.operator === 'in' && Array.isArray(filter.value)) {
        // For IN operator, join array values with commas
        endpoint += `&${filter.column}=in:${filter.value.join(',')}`;
      } else if (filter.operator === 'or') {
        // For OR operator, pass the raw filter string
        endpoint += `&_or=or:${filter.value}`;
      } else {
        endpoint += `&${filter.column}=${filter.operator}:${filter.value}`;
      }
    }
    if (orderBy) {
      endpoint += `&order_by=${orderBy.column}:${orderBy.ascending ? 'asc' : 'desc'}`;
    }
    if (limitCount) {
      endpoint += `&limit=${limitCount}`;
    }
    return this.request('GET', endpoint);
  }

  rpc = (name: string, params: unknown) => ({
    then: async (onResolve: (result: any) => void, onReject?: (error: any) => void) => {
      try {
        const result = await this.request('POST', `/rpc/${name}`, params);
        onResolve({ data: result, error: null });
      } catch (error) {
        onReject?.({ data: null, error });
      }
    },
  });

  channel = (name: string) => ({
    on: (event: string, filter: any, callback?: (payload: any) => void) => ({
      on: (event2: string, filter2: any, callback2?: (payload: any) => void) => ({
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    subscribe: () => ({ unsubscribe: () => {} }),
  });

  removeChannel = (channel?: any) => {};

  // Storage stub - upload files locally
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          
          const response = await fetch(`${API_URL}/storage/${bucket}/upload`, {
            method: 'POST',
            body: formData,
            headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
          });
          
          if (!response.ok) {
            return { data: null, error: { message: 'Upload failed' } };
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      getPublicUrl: (path: string) => ({
        publicUrl: `${API_URL}/storage/${bucket}/public/${path}`,
      }),
    }),
  };

  // Functions - invoke serverless functions
  functions = {
    invoke: async (functionName: string, options?: { body?: unknown }) => {
      try {
        const response = await fetch(`${API_URL}/functions/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const data = await response.json();
        
        if (!response.ok) {
          return { data: null, error: data.error || 'Function call failed' };
        }
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
  };
}

export const supabase = new LocalAPIClient();
