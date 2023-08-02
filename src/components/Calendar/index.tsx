import { CaretLeft, CaretRight } from 'phosphor-react'
import {
  CalendarActions,
  CalendarContainer,
  CalendarHeader,
  CalendarTitle,
  CalendarBody,
  CalendarDay,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

interface CalendarProps {
  selectedDate?: Date | null
  onDateSelected: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1)
  })

  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')

  function handlePreviousMonth() {
    const previousMonth = currentDate.subtract(1, 'month')
    setCurrentDate(previousMonth)
  }

  function handleNextMonth() {
    const nextMonth = currentDate.add(1, 'month')
    setCurrentDate(nextMonth)
  }

  const calendarWeeks = useMemo(() => {
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      return currentDate.set('date', i + 1) // date: dia day: dia da semana // para nao ter dia "0"
    })

    const firstWeekDay = currentDate.get('day') // daysInMonthArray setou os dias no mes, entao pegamos o dia da semana aqui

    // primeiro dia do mes(ex: 6 'sabado'), que é tambem 6 dias do mes passado pra preencher
    // pegar os dias que sobraram do mes passado para preencher o calendario
    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day') // voltará os dias ( que sao os dias anteriores do mes )
      })
      .reverse()

    const lastWeekDay = currentDate
      .set('date', currentDate.daysInMonth()) // seta o dia no ultimo dia do mes
      .get('day') //

    const nextMonthFillArray = Array.from({
      // length: 7 - (lastWeekDay +1 ), poderia ser
      length: 6 - lastWeekDay, // 6 pq começa no zero
    }).map((_, i) => {
      return currentDate
        .set('date', currentDate.daysInMonth())
        .add(i + 1, 'day')
    })

    const calendarDays = [
      // total
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        return { date, disabled: date.endOf('day').isBefore(new Date()) }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ]

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, index, original) => {
        const isNewWeek = index % 7 === 0 // na primeira vez, ate o 6 é true e assim por diante

        if (isNewWeek) {
          weeks.push({
            week: index / 7 + 1, // pois nao queremos q index começe em 0
            days: original.slice(index, index + 7),
          })
        }
        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate])

  console.log(calendarWeeks)

  const shortWeekDays = getWeekDays({ short: true })
  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span> {currentYear}</span>
        </CalendarTitle>
        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous Month">
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth} title="Next Month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((day) => (
              <th key={day}>{day}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map((week) => {
            return (
              <tr key={week.week}>
                {week.days.map((day) => {
                  return (
                    <td key={day.date.toString()}>
                      <CalendarDay
                        onClick={() => onDateSelected(day.date.toDate())}
                        disabled={day.disabled}
                      >
                        {day.date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
