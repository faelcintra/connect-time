import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end() // pois essa é uma rota que busca(get) disponibilidade
  }

  const username = String(req.query.username)
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
  }

  // buscando user do banco pra ver se existe igual do params
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('date').isBefore(new Date())

  if (isPastDate) {
    // caso a data passada no params seja anterior ao dia atual, retorna sem horarios disponiveis
    return res.json({ possibleTimes: [], availability: [] })
  }

  // TimeInterval x Scheduling => lógica de cross entre TimeInterval (intervalo de tempo disponivel que o usuario selecionou), com os schedulings

  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  // caso nao tenha horarios disponiveis no dia, retorna vazio
  if (!userAvailability) {
    return res.json({ possibleTimes: [], availability: [] })
  }

  // caso tenho pelo menos um horario disponivel no dia
  const {
    time_start_in_minutes: startTimeInMinutes, // ex: 10
    time_end_in_minutes: endTimeInMinutes, // ex: 18
  } = userAvailability
  // ex: [10, 11, 12, 13, 14, 15, 16, 17, 18] => 18 nao entra pois é qnd ele termina
  // logo => [10, 11, 12, 13, 14, 15, 16, 17], que se fizermos a conta endTime - startTime = 8
  const startHour = startTimeInMinutes / 60
  const endHour = endTimeInMinutes / 60

  const possibleTimes = Array.from({
    length: endHour - startHour,
  }).map((_, i) => {
    return startHour + i
  })

  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(), // converter para Date pois o prisma so aceita esse tipo
        lte: referenceDate.set('hour', endHour).toDate(), // gte: maior ou igual  | ltd: menor ou igual
      },
    },
  })

  // validar se NAO existe nenhum blockedtime(registro em scheduling) onde bate o horario (time) com o agendamento
  const availableTimes = possibleTimes.filter((time) => {
    return !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
  })

  return res.json({ possibleTimes, availableTimes })
}
