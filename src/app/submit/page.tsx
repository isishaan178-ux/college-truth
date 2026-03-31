'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

const categories = [
  { value: 'PLACEMENTS', label: 'Placements' },
  { value: 'HOSTEL_MESS', label: 'Hostel & Mess' },
  { value: 'PROFESSORS', label: 'Professors & Teaching' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health & Pressure' },
  { value: 'CAMPUS_LIFE', label: 'Campus Life & Culture' },
  { value: 'SPORTS', label: 'Sports & Facilities' },
  { value: 'RESTRICTIONS', label: 'Rules & Restrictions' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'NEWS_CONTROVERSY', label: 'News & Controversy' },
]

export default function SubmitPage() {
  const [collegeName, setCollegeName] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collegeName || !category || !content) {
      setError('Please fill all required fields')
      return
    }
    if (content.length < 20) {
      setError('Please write at least 20 characters')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeName,
          category,
          content,
          author: isAnonymous ? 'Anonymous' : authorName || 'Anonymous',
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-green-500/30 bg-green-500/5">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              Your experience has been submitted for review. Once verified by our team, it will appear on the college page.
            </p>
            <Button onClick={() => { setSubmitted(false); setCollegeName(''); setCategory(''); setContent(''); }} variant="outline">
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Share Your <span className="text-indigo-400">College Truth</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Help fellow students make informed decisions. Your honest experience matters. All submissions are reviewed before publishing.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Shield className="w-3.5 h-3.5 text-green-400" /> 100% Anonymous
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Eye className="w-3.5 h-3.5 text-blue-400" /> Verified Before Publishing
          </Badge>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your College Experience</CardTitle>
            <CardDescription>Be honest, be specific. Vague reviews don&apos;t help anyone.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* College Name */}
              <div className="space-y-2">
                <Label htmlFor="college">College Name *</Label>
                <Input
                  id="college"
                  placeholder="e.g. VIT Vellore, BITS Pilani, DTU Delhi..."
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="What is this about?" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Your Experience *</Label>
                <Textarea
                  id="content"
                  placeholder="Tell us the truth about your college. Be specific - mention names of buildings, hostels, canteens, departments. What do they advertise vs what actually happens? How are placements really? How is the food? Are professors helpful or just reading from slides?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length}/20 minimum characters
                </p>
              </div>

              {/* Anonymous toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-indigo-500' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : ''}`} />
                  </button>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isAnonymous ? 'Anonymous' : 'Show my name'}
                  </Label>
                </div>

                {!isAnonymous && (
                  <Input
                    placeholder="Your name (optional)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Your Experience'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
