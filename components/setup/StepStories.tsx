'use client'

import { useState, useEffect } from 'react'
import { BookOpen, ClipboardList, Library, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import StoryItem from '@/components/StoryItem'
import { Story } from '@/types'

type AnyDispatch = React.Dispatch<{ type: string; payload: unknown }>

interface Props {
  stories: Story[]
  dispatch: AnyDispatch
  projectId?: string
}

export default function StepStories({ stories, dispatch, projectId }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [adding, setAdding] = useState(false)
  const [library, setLibrary] = useState<Story[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  useEffect(() => {
    if (!projectId) { setLibrary([]); return }
    setLibraryLoading(true)
    fetch(`/api/stories?projectId=${projectId}`)
      .then(r => r.json())
      .then((data: Story[]) => setLibrary(Array.isArray(data) ? data : []))
      .catch(() => setLibrary([]))
      .finally(() => setLibraryLoading(false))
  }, [projectId])

  const addStory = async () => {
    if (!title.trim() && !body.trim()) return
    const newStory: Story = { title: title.trim() || 'Untitled story', body: body.trim() }

    if (projectId) {
      setAdding(true)
      try {
        const res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newStory.title, body: newStory.body, projectId }),
        })
        const saved: Story = await res.json()
        dispatch({ type: 'ADD_STORY', payload: saved })
        setLibrary(prev => [saved, ...prev])
      } catch {
        dispatch({ type: 'ADD_STORY', payload: newStory })
      } finally {
        setAdding(false)
      }
    } else {
      dispatch({ type: 'ADD_STORY', payload: newStory })
    }

    setTitle('')
    setBody('')
  }

  const addFromLibrary = (story: Story) => {
    const alreadyAdded = stories.some(s => s.id === story.id)
    if (alreadyAdded) return
    dispatch({ type: 'ADD_STORY', payload: story })
  }

  const deleteFromLibrary = async (story: Story) => {
    if (!story.id) return
    try {
      await fetch(`/api/stories/${story.id}`, { method: 'DELETE' })
      setLibrary(prev => prev.filter(s => s.id !== story.id))
    } catch { /* non-blocking */ }
  }

  const removeStory = (i: number) => dispatch({ type: 'REMOVE_STORY', payload: i })

  const addedIds = new Set(stories.map(s => s.id).filter(Boolean))

  return (
    <div className="space-y-5">
      {/* Add story form */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Add user stories</div>
            <div className="text-xs text-gray-500">Plain prose, bullet points, or Gherkin — any format works</div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="story-title">Story title</Label>
            <Input
              id="story-title"
              placeholder="e.g. User completes checkout with saved card"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !adding && addStory()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="story-body">Steps / description</Label>
            <Textarea
              id="story-body"
              rows={5}
              placeholder={`As a logged-in user, I want to add a product to cart and complete checkout.\n\n1. Navigate to /products\n2. Click 'Add to cart' on any product\n3. Click the cart icon\n4. Click 'Proceed to checkout'\n5. Click 'Place order'\n6. Expect: order confirmation screen`}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={addStory} disabled={adding}>
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add story{projectId ? ' & save to library' : ''}
          </Button>
        </div>
      </div>

      {/* Library panel — only shown when a project is selected */}
      {projectId && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
              <Library className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Story library</div>
              <div className="text-xs text-gray-500">Saved stories for this project</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {libraryLoading ? (
              <div className="px-5 py-4 flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading library…
              </div>
            ) : library.length === 0 ? (
              <div className="px-5 py-4 text-xs text-gray-400">
                No stories saved yet. Add one above to populate the library.
              </div>
            ) : (
              library.map(story => {
                const added = addedIds.has(story.id)
                return (
                  <div key={story.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${added ? 'text-gray-400' : 'text-gray-800'}`}>
                        {story.title}
                      </div>
                      {story.body && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{story.body}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addFromLibrary(story)}
                        disabled={added}
                        className="h-7 px-2.5 text-xs"
                      >
                        {added ? 'Added' : 'Add'}
                      </Button>
                      <button
                        onClick={() => deleteFromLibrary(story)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete from library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Stories added to this run */}
      {stories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-9 h-9 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No stories added yet. Add at least one to continue.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stories.map((s, i) => (
            <StoryItem key={s.id ?? i} story={s} index={i} onRemove={removeStory} />
          ))}
        </div>
      )}
    </div>
  )
}
