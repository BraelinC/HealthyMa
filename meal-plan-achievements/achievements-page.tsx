"use client"

import React from "react"

import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Trophy,
  Target,
  Calendar,
  Utensils,
  Clock,
  Star,
  Award,
  CheckCircle,
  Lock,
  Flame,
  Heart,
  Leaf,
  ChefHat,
} from "lucide-react"
import { useState } from "react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: ReactNode
  category: string
  isUnlocked: boolean
  progress: number
  maxProgress: number
  points: number
  unlockedDate?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function AchievementsPage() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const [achievements] = useState<Achievement[]>([
    // Consistency Achievements
    {
      id: "1",
      title: "Meal Prep Master",
      description: "Plan meals for 7 consecutive days",
      icon: <ChefHat className="w-5 h-5" />,
      category: "consistency",
      isUnlocked: true,
      progress: 7,
      maxProgress: 7,
      points: 100,
      unlockedDate: "2024-01-15",
      rarity: "rare",
    },
    {
      id: "2",
      title: "Streak Starter",
      description: "Maintain a 3-day meal planning streak",
      icon: <Flame className="w-5 h-5" />,
      category: "consistency",
      isUnlocked: true,
      progress: 3,
      maxProgress: 3,
      points: 50,
      unlockedDate: "2024-01-10",
      rarity: "common",
    },
    {
      id: "3",
      title: "Monthly Planner",
      description: "Plan meals for an entire month",
      icon: <Calendar className="w-5 h-5" />,
      category: "consistency",
      isUnlocked: false,
      progress: 18,
      maxProgress: 30,
      points: 250,
      rarity: "epic",
    },
    {
      id: "4",
      title: "Dedication",
      description: "Plan meals for 100 consecutive days",
      icon: <Award className="w-5 h-5" />,
      category: "consistency",
      isUnlocked: false,
      progress: 45,
      maxProgress: 100,
      points: 500,
      rarity: "legendary",
    },
    {
      id: "5",
      title: "Weekend Warrior",
      description: "Plan weekend meals for 4 weeks straight",
      icon: <Star className="w-5 h-5" />,
      category: "consistency",
      isUnlocked: true,
      progress: 4,
      maxProgress: 4,
      points: 75,
      unlockedDate: "2024-01-20",
      rarity: "common",
    },

    // Health Achievements
    {
      id: "6",
      title: "Veggie Lover",
      description: "Include vegetables in 20 meals",
      icon: <Leaf className="w-5 h-5" />,
      category: "health",
      isUnlocked: true,
      progress: 20,
      maxProgress: 20,
      points: 75,
      unlockedDate: "2024-01-12",
      rarity: "common",
    },
    {
      id: "7",
      title: "Balanced Diet",
      description: "Create 10 nutritionally balanced meals",
      icon: <Heart className="w-5 h-5" />,
      category: "health",
      isUnlocked: false,
      progress: 6,
      maxProgress: 10,
      points: 150,
      rarity: "rare",
    },
    {
      id: "8",
      title: "Protein Power",
      description: "Plan 15 high-protein meals",
      icon: <Target className="w-5 h-5" />,
      category: "health",
      isUnlocked: false,
      progress: 2,
      maxProgress: 15,
      points: 100,
      rarity: "common",
    },
    {
      id: "9",
      title: "Rainbow Plate",
      description: "Create meals with 5+ different colored foods",
      icon: <Star className="w-5 h-5" />,
      category: "health",
      isUnlocked: true,
      progress: 8,
      maxProgress: 8,
      points: 125,
      unlockedDate: "2024-01-18",
      rarity: "rare",
    },
    {
      id: "10",
      title: "Superfood Champion",
      description: "Include superfoods in 25 different meals",
      icon: <Award className="w-5 h-5" />,
      category: "health",
      isUnlocked: false,
      progress: 12,
      maxProgress: 25,
      points: 200,
      rarity: "epic",
    },
    {
      id: "11",
      title: "Hydration Hero",
      description: "Plan water-rich meals for optimal hydration",
      icon: <Heart className="w-5 h-5" />,
      category: "health",
      isUnlocked: true,
      progress: 5,
      maxProgress: 5,
      points: 50,
      unlockedDate: "2024-01-14",
      rarity: "common",
    },

    // Milestone Achievements
    {
      id: "12",
      title: "First Steps",
      description: "Create your first meal plan",
      icon: <Star className="w-5 h-5" />,
      category: "milestones",
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      points: 25,
      unlockedDate: "2024-01-08",
      rarity: "common",
    },
    {
      id: "13",
      title: "Century Club",
      description: "Plan 100 total meals",
      icon: <Trophy className="w-5 h-5" />,
      category: "milestones",
      isUnlocked: false,
      progress: 47,
      maxProgress: 100,
      points: 500,
      rarity: "legendary",
    },
    {
      id: "14",
      title: "Recipe Explorer",
      description: "Try 25 different recipes",
      icon: <Utensils className="w-5 h-5" />,
      category: "milestones",
      isUnlocked: false,
      progress: 12,
      maxProgress: 25,
      points: 200,
      rarity: "epic",
    },
    {
      id: "15",
      title: "Halfway There",
      description: "Complete 50 meal plans",
      icon: <Target className="w-5 h-5" />,
      category: "milestones",
      isUnlocked: true,
      progress: 50,
      maxProgress: 50,
      points: 150,
      unlockedDate: "2024-01-22",
      rarity: "rare",
    },
    {
      id: "16",
      title: "Meal Master",
      description: "Plan 500 total meals",
      icon: <Award className="w-5 h-5" />,
      category: "milestones",
      isUnlocked: false,
      progress: 156,
      maxProgress: 500,
      points: 1000,
      rarity: "legendary",
    },

    // Efficiency Achievements
    {
      id: "17",
      title: "Speed Planner",
      description: "Create a weekly meal plan in under 10 minutes",
      icon: <Clock className="w-5 h-5" />,
      category: "efficiency",
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
      points: 75,
      unlockedDate: "2024-01-14",
      rarity: "rare",
    },
    {
      id: "18",
      title: "Batch Genius",
      description: "Plan 5 meals using batch cooking",
      icon: <ChefHat className="w-5 h-5" />,
      category: "efficiency",
      isUnlocked: false,
      progress: 3,
      maxProgress: 5,
      points: 100,
      rarity: "rare",
    },
    {
      id: "19",
      title: "Prep Pro",
      description: "Complete meal prep in under 2 hours",
      icon: <Clock className="w-5 h-5" />,
      category: "efficiency",
      isUnlocked: true,
      progress: 3,
      maxProgress: 3,
      points: 125,
      unlockedDate: "2024-01-16",
      rarity: "rare",
    },
    {
      id: "20",
      title: "One-Pot Wonder",
      description: "Create 10 one-pot meals",
      icon: <Utensils className="w-5 h-5" />,
      category: "efficiency",
      isUnlocked: false,
      progress: 4,
      maxProgress: 10,
      points: 100,
      rarity: "common",
    },

    // Creativity Achievements
    {
      id: "21",
      title: "Fusion Master",
      description: "Create 5 fusion cuisine meals",
      icon: <Star className="w-5 h-5" />,
      category: "creativity",
      isUnlocked: true,
      progress: 5,
      maxProgress: 5,
      points: 150,
      unlockedDate: "2024-01-19",
      rarity: "rare",
    },
    {
      id: "22",
      title: "Leftover Legend",
      description: "Transform leftovers into 15 new meals",
      icon: <Award className="w-5 h-5" />,
      category: "creativity",
      isUnlocked: false,
      progress: 8,
      maxProgress: 15,
      points: 175,
      rarity: "epic",
    },
    {
      id: "23",
      title: "Seasonal Chef",
      description: "Plan meals using seasonal ingredients for 4 seasons",
      icon: <Leaf className="w-5 h-5" />,
      category: "creativity",
      isUnlocked: false,
      progress: 2,
      maxProgress: 4,
      points: 200,
      rarity: "epic",
    },
    {
      id: "24",
      title: "Theme Night",
      description: "Create 10 themed dinner nights",
      icon: <Star className="w-5 h-5" />,
      category: "creativity",
      isUnlocked: true,
      progress: 10,
      maxProgress: 10,
      points: 125,
      unlockedDate: "2024-01-21",
      rarity: "rare",
    },

    // Budget Achievements
    {
      id: "25",
      title: "Budget Boss",
      description: "Stay under budget for 10 consecutive weeks",
      icon: <Target className="w-5 h-5" />,
      category: "budget",
      isUnlocked: false,
      progress: 6,
      maxProgress: 10,
      points: 200,
      rarity: "epic",
    },
    {
      id: "26",
      title: "Penny Pincher",
      description: "Create 20 meals under $5 per serving",
      icon: <Award className="w-5 h-5" />,
      category: "budget",
      isUnlocked: true,
      progress: 20,
      maxProgress: 20,
      points: 150,
      unlockedDate: "2024-01-17",
      rarity: "rare",
    },
    {
      id: "27",
      title: "Coupon King",
      description: "Save $100 using coupons and deals",
      icon: <Star className="w-5 h-5" />,
      category: "budget",
      isUnlocked: false,
      progress: 45,
      maxProgress: 100,
      points: 175,
      rarity: "epic",
    },

    // Special Achievements
    {
      id: "28",
      title: "Early Bird",
      description: "Plan next week's meals every Sunday for 8 weeks",
      icon: <Clock className="w-5 h-5" />,
      category: "special",
      isUnlocked: true,
      progress: 8,
      maxProgress: 8,
      points: 100,
      unlockedDate: "2024-01-23",
      rarity: "rare",
    },
    {
      id: "29",
      title: "Holiday Hero",
      description: "Plan special meals for 5 different holidays",
      icon: <Star className="w-5 h-5" />,
      category: "special",
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
      points: 150,
      rarity: "epic",
    },
    {
      id: "30",
      title: "Meal Planning Legend",
      description: "Unlock all other achievements",
      icon: <Trophy className="w-5 h-5" />,
      category: "special",
      isUnlocked: false,
      progress: 12,
      maxProgress: 29,
      points: 1000,
      rarity: "legendary",
    },
  ])

  const totalPoints = achievements.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.points, 0)

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const totalCount = achievements.length

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          outer: "#22c55e", // green-500
          ribbon: "#dc2626", // red-600
          text: "text-green-700",
          badge: "bg-green-100 text-green-700 border-green-300",
        }
      case "rare":
        return {
          outer: "#3b82f6", // blue-500
          ribbon: "#dc2626", // red-600
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-700 border-blue-300",
        }
      case "epic":
        return {
          outer: "#8b5cf6", // violet-500
          ribbon: "#dc2626", // red-600
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-700 border-purple-300",
        }
      case "legendary":
        return {
          outer: "#eab308", // yellow-500
          ribbon: "#dc2626", // red-600
          text: "text-orange-700",
          badge: "bg-yellow-100 text-orange-700 border-yellow-300",
        }
      default:
        return {
          outer: "#6b7280", // gray-500
          ribbon: "#6b7280", // gray-500
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-700 border-gray-300",
        }
    }
  }

  const MedalComponent = ({
    achievement,
    size = "small",
    onClick,
  }: { achievement: Achievement; size?: "small" | "large"; onClick?: () => void }) => {
    const colors = getRarityColors(achievement.rarity)
    const isLocked = !achievement.isUnlocked
    const isLarge = size === "large"
    const medalSize = isLarge ? 128 : 64
    const iconSize = isLarge ? "w-12 h-12" : "w-6 h-6"

    return (
      <div
        className={`relative ${isLarge ? "w-32 h-40" : "w-20 h-28"} mx-auto ${onClick ? "cursor-pointer" : ""} transition-all duration-300 hover:scale-110 ${isLocked ? "opacity-60" : ""}`}
        onClick={onClick}
      >
        {/* Medal Circle */}
        <div className={`relative ${isLarge ? "w-32 h-32" : "w-16 h-16"} mx-auto`}>
          {/* Outer Scalloped Ring */}
          <svg
            width={medalSize}
            height={medalSize}
            viewBox={`0 0 ${medalSize} ${medalSize}`}
            className="absolute inset-0"
          >
            <circle
              cx={medalSize / 2}
              cy={medalSize / 2}
              r={medalSize / 2 - 2}
              fill={isLocked ? "#9ca3af" : colors.outer}
              stroke={isLocked ? "#6b7280" : colors.outer}
              strokeWidth="2"
              style={{
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`,
              }}
            />
            {/* Scalloped edge pattern */}
            <g>
              {Array.from({ length: isLarge ? 32 : 24 }, (_, i) => {
                const angle = i * (360 / (isLarge ? 32 : 24)) * (Math.PI / 180)
                const x = medalSize / 2 + Math.cos(angle) * (medalSize / 2 - 4)
                const y = medalSize / 2 + Math.sin(angle) * (medalSize / 2 - 4)
                return (
                  <circle key={i} cx={x} cy={y} r={isLarge ? "3" : "2"} fill={isLocked ? "#9ca3af" : colors.outer} />
                )
              })}
            </g>
          </svg>

          {/* Inner Red Ring */}
          <div
            className={`absolute ${isLarge ? "inset-4" : "inset-2"} rounded-full`}
            style={{ backgroundColor: colors.ribbon }}
          >
            {/* White Center */}
            <div
              className={`absolute ${isLarge ? "inset-2" : "inset-1"} bg-white rounded-full flex items-center justify-center`}
            >
              {/* Achievement Icon */}
              <div className={`${isLocked ? "text-gray-400" : "text-gray-700"}`}>
                {isLocked ? (
                  <Lock className={iconSize} />
                ) : (
                  React.cloneElement(achievement.icon as React.ReactElement, { className: iconSize })
                )}
              </div>
            </div>
          </div>

          {/* Points Badge */}
          <div
            className={`absolute ${isLarge ? "-top-2 -right-2 w-10 h-10" : "-top-1 -right-1 w-6 h-6"} bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg`}
          >
            <span className={`text-white ${isLarge ? "text-sm" : "text-xs"} font-bold`}>
              {isLocked ? "?" : achievement.points}
            </span>
          </div>

          {/* Completion Checkmark */}
          {!isLocked && (
            <div
              className={`absolute ${isLarge ? "-top-2 -left-2 w-8 h-8" : "-top-1 -left-1 w-5 h-5"} bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg`}
            >
              <CheckCircle className={`${isLarge ? "w-5 h-5" : "w-3 h-3"} text-white`} />
            </div>
          )}
        </div>

        {/* Ribbon Banner */}
        <div
          className={`absolute ${isLarge ? "top-24 w-16 h-12" : "top-12 w-8 h-6"} left-1/2 transform -translate-x-1/2`}
        >
          <svg
            width={isLarge ? "64" : "32"}
            height={isLarge ? "48" : "24"}
            viewBox={`0 0 ${isLarge ? "64" : "32"} ${isLarge ? "48" : "24"}`}
          >
            <path
              d={isLarge ? "M0 0 L64 0 L64 32 L32 48 L0 32 Z" : "M0 0 L32 0 L32 16 L16 24 L0 16 Z"}
              fill={isLocked ? "#6b7280" : colors.ribbon}
              style={{
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
              }}
            />
          </svg>
        </div>
      </div>
    )
  }

  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => {
    return (
      <div className="relative group">
        <MedalComponent achievement={achievement} size="small" onClick={() => setSelectedAchievement(achievement)} />

        {/* Badge Info */}
        <div className="mt-2 text-center">
          <h3
            className={`font-medium text-xs leading-tight ${!achievement.isUnlocked ? "text-gray-500" : "text-gray-900"}`}
          >
            {achievement.title}
          </h3>

          {/* Rarity Badge */}
          <div className="flex justify-center mt-1">
            <Badge className={`text-xs px-1.5 py-0.5 ${getRarityColors(achievement.rarity).badge}`}>
              {achievement.rarity}
            </Badge>
          </div>

          {/* Progress for locked achievements */}
          {!achievement.isUnlocked && (
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">
                {achievement.progress}/{achievement.maxProgress}
              </div>
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1" />
            </div>
          )}

          {/* Unlock Date */}
          {achievement.isUnlocked && achievement.unlockedDate && (
            <p className="text-xs text-green-600 mt-1 opacity-75">
              {new Date(achievement.unlockedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600 mb-4">Track your meal planning progress and unlock rewards</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{totalPoints}</p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {unlockedCount}/{totalCount}
                    </p>
                    <p className="text-sm text-gray-600">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievement Badges Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Achievements</h2>
            <p className="text-sm text-gray-600">Click on any achievement to view details</p>
          </div>
          <div className="h-96 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Detail Modal */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-md">
            {selectedAchievement && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">{selectedAchievement.title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4 py-4">
                  {/* Large Medal */}
                  <MedalComponent achievement={selectedAchievement} size="large" />

                  {/* Achievement Details */}
                  <div className="text-center space-y-3">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedAchievement.isUnlocked ? selectedAchievement.description : "???"}
                    </p>

                    <div className="flex justify-center">
                      <Badge className={`${getRarityColors(selectedAchievement.rarity).badge} px-3 py-1`}>
                        {selectedAchievement.rarity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{selectedAchievement.points}</p>
                        <p className="text-gray-500">Points</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{selectedAchievement.category}</p>
                        <p className="text-gray-500">Category</p>
                      </div>
                    </div>

                    {selectedAchievement.isUnlocked ? (
                      selectedAchievement.unlockedDate && (
                        <div className="text-center">
                          <p className="text-green-600 font-medium">Unlocked</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(selectedAchievement.unlockedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2">
                        <div className="text-center">
                          <p className="text-gray-500 font-medium">Progress</p>
                          <p className="text-gray-900 font-semibold">
                            {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                          </p>
                        </div>
                        <Progress
                          value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
