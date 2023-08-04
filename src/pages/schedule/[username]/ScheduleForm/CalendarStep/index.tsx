import { Calendar } from '@/src/components/Calendar'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'

interface Availability {
  possibleTimes: number[] // todos os horarios possiveis
  availableTimes: number[] // apenas os disponiveis
} // logica: listar todos os possiveis, mas deixar habilitado somente os disponiveis

export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)

  const router = useRouter()
  const username = String(router.query.username)

  const isDateSelected = !!selectedDate

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD [ de ] MMMM')
    : null

  useEffect(() => {
    if (!selectedDate) {
      return
    }

    api
      .get(`/users/${username}/availability`, {
        params: {
          date: dayjs(selectedDate).format('YYYY-MM-DD'),
        },
      })
      .then((response) => {
        setAvailability(response.data)
      })
  }, [selectedDate, username])
  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
            <TimePickerList>
              {availability?.possibleTimes.map((hour) => {
                return (
                  <TimePickerItem
                    key={hour}
                    disabled={!availability.availableTimes.includes(hour)}
                  >
                    {String(hour).padStart(2, '0')}:00h
                  </TimePickerItem>
                )
              })}
            </TimePickerList>
          </TimePickerHeader>
        </TimePicker>
      )}
    </Container>
  )
}
