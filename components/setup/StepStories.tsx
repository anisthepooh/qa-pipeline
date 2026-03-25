'use client'

import { useState } from 'react'
import { BookOpen, ClipboardList } from 'lucide-react'
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
}

export default function StepStories({ stories, dispatch }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const addStory = () => {
    if (!title.trim() && !body.trim()) return
    dispatch({ type: 'ADD_STORY', payload: { title: title.trim() || 'Untitled story', body: body.trim() } })
    setTitle('')
    setBody('')
  }

  const removeStory = (i: number) => dispatch({ type: 'REMOVE_STORY', payload: i })

  return (
    <div className="space-y-5">
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
              onKeyDown={e => e.key === 'Enter' && addStory()}
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
          <Button size="sm" onClick={addStory}>+ Add story</Button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-9 h-9 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No stories added yet. Add at least one to continue.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stories.map((s, i) => (
            <StoryItem key={i} story={s} index={i} onRemove={removeStory} />
          ))}
        </div>
      )}
    </div>
  )
}
