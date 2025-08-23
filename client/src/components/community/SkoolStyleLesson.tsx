import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  BarChart3,
  FileText,
  Clock,
  Image,
  Video,
  Target,
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  Pause
} from 'lucide-react';

interface LessonData {
  id: number;
  title: string;
  description: string;
  comments_enabled?: boolean;
  poll_enabled?: boolean;
  notes_enabled?: boolean;
  timer_enabled?: boolean;
  image_enabled?: boolean;
  video_enabled?: boolean;
}

interface SkoolStyleLessonProps {
  lesson: LessonData;
  isEditing?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export function SkoolStyleLesson({ lesson, isEditing = false, onBack, onNext }: SkoolStyleLessonProps) {
  const [studentNotes, setStudentNotes] = useState('');
  const [pollVote, setPollVote] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [comments, setComments] = useState<Array<{ id: number; text: string; author: string }>>([]);
  const [newComment, setNewComment] = useState('');

  // Parse learning objectives from description
  const getLearningObjectives = (description: string): string[] => {
    const lines = description.split('\n');
    const objectives: string[] = [];
    let inObjectives = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('learning objectives') || line.toLowerCase().includes('objectives')) {
        inObjectives = true;
        continue;
      }
      if (inObjectives && line.trim().startsWith('•')) {
        objectives.push(line.replace('•', '').trim());
      } else if (inObjectives && line.trim() && !line.startsWith('•')) {
        break;
      }
    }
    return objectives;
  };

  // Parse numbered sections from description
  const getNumberedSections = (description: string) => {
    const lines = description.split('\n');
    const sections: Array<{ number: string; title: string; content: string[] }> = [];
    let currentSection: { number: string; title: string; content: string[] } | null = null;
    
    for (const line of lines) {
      const match = line.match(/^(\d+)\.\s*(.+)/);
      if (match) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          number: match[1],
          title: match[2],
          content: []
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line.trim());
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const objectives = getLearningObjectives(lesson.description);
  const sections = getNumberedSections(lesson.description);

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        text: newComment,
        author: 'Student'
      }]);
      setNewComment('');
    }
  };

  const startTimer = () => {
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Menu
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          className="text-blue-400 hover:text-blue-300"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Lesson Title */}
        <h1 className="text-white text-2xl font-bold mb-6">{lesson.title}</h1>

        {/* Learning Objectives */}
        {objectives.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-white text-lg font-semibold">Learning Objectives</h2>
            </div>
            <p className="text-gray-300 mb-3">By the end of this module, you will be able to:</p>
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-white">{objective}</span>
                </div>
              ))}
            </div>
            <hr className="border-gray-600 mt-6" />
          </div>
        )}

        {/* Numbered Sections */}
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">
              {section.number}. {section.title}
            </h3>
            {section.content.length > 0 && (
              <div className="bg-gray-800 border-l-4 border-gray-600 p-4 rounded-r">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-300 mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Interactive Features */}
        <div className="space-y-6 mt-8">
          {/* Comments Section */}
          {lesson.comments_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Discussion</h3>
                </div>
                
                <div className="space-y-4 mb-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-400 mb-1">{comment.author}</div>
                      <div className="text-white">{comment.text}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                    rows={2}
                  />
                  <Button onClick={addComment} className="bg-blue-600 hover:bg-blue-700">
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Poll Section */}
          {lesson.poll_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Quick Poll</h3>
                </div>
                
                <p className="text-gray-300 mb-4">How would you rate your understanding so far?</p>
                
                <div className="space-y-2">
                  {['Excellent', 'Good', 'Fair', 'Need Help'].map((option) => (
                    <Button
                      key={option}
                      variant={pollVote === option ? "default" : "outline"}
                      onClick={() => setPollVote(option)}
                      className="w-full justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          {lesson.notes_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">Your Notes</h3>
                </div>
                
                <Textarea
                  placeholder="Take notes about this lesson..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
                
                <Button className="mt-3 bg-green-600 hover:bg-green-700">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timer Section */}
          {lesson.timer_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h3 className="text-white font-semibold">Practice Timer</h3>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) * 60 || 0)}
                    className="bg-gray-700 border-gray-600 text-white w-24"
                    disabled={timerRunning}
                  />
                  <Button
                    onClick={startTimer}
                    disabled={timerRunning || timerSeconds === 0}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Running' : 'Start'}
                  </Button>
                </div>
                
                {timerSeconds > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-mono text-white">
                      {formatTime(timerSeconds)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Image Upload Section */}
          {lesson.image_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-5 h-5 text-pink-400" />
                  <h3 className="text-white font-semibold">Share an Image</h3>
                </div>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Click to upload an image</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Section */}
          {lesson.video_enabled && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-semibold">Video Content</h3>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300">Video sharing and discussion features are available for this lesson.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}