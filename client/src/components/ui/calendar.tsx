import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState<Date | null>(null)
  
  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    setDragStart(date)
    if (props.onSelect && props.mode === "range") {
      props.onSelect({ from: date, to: date } as any)
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStart && props.onSelect && props.mode === "range") {
      const from = dragStart <= date ? dragStart : date
      const to = dragStart <= date ? date : dragStart
      props.onSelect({ from, to } as any)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
    }
  }

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setDragStart(null)
      }
    }

    const handleGlobalMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false)
        setDragStart(null)
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mouseleave', handleGlobalMouseLeave)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mouseleave', handleGlobalMouseLeave)
    }
  }, [isDragging])

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 cursor-pointer user-select-none"
        ),

        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground border-2 border-primary",
        day_today: "bg-secondary/20 text-secondary-foreground border-2 border-secondary font-bold",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-primary/10 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-primary/20 aria-selected:text-foreground border border-primary/30",
        day_range_start: "rounded-l-md bg-primary text-primary-foreground border-2 border-primary",
        day_range_end: "rounded-r-md bg-primary text-primary-foreground border-2 border-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        Day: (dayProps) => {
          const { date, displayMonth } = dayProps
          const buttonRef = React.useRef<HTMLButtonElement>(null)
          
          return (
            <button
              {...dayProps}
              ref={buttonRef}
              onMouseDown={(e) => {
                e.preventDefault()
                handleMouseDown(date)
                if (dayProps.onMouseDown) dayProps.onMouseDown(e)
              }}
              onMouseEnter={(e) => {
                handleMouseEnter(date)
                if (dayProps.onMouseEnter) dayProps.onMouseEnter(e)
              }}
              onMouseUp={(e) => {
                handleMouseUp()
                if (dayProps.onMouseUp) dayProps.onMouseUp(e)
              }}
              className={cn(
                dayProps.className,
                isDragging && "pointer-events-auto"
              )}
              style={{
                ...dayProps.style,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              {date.getDate()}
            </button>
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
