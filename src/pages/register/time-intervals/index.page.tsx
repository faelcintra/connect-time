import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Container, Header } from '../styles'
import {
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
  FormError,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { convertTimeInMinutes } from '@/src/utils/convert-time-in-minutes'
import { api } from '@/src/lib/axios'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        checked: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.checked))
    .refine((intervals) => intervals.length > 0, {
      message: 'Selecione no minimo um dia da semana!',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeInMinutes(interval.startTime),
          endTimeInMinutes: convertTimeInMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          // se todos tem uma diferença de pelomenos uma hora
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ter no minimo 1hr distante do início.',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema> // os dados como entra no zod
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema> // os dados como sai do zod

export default function TimeIntervals() {
  const {
    formState: { isSubmitting, errors },
    control,
    handleSubmit,
    register,
    watch,
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, checked: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, checked: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, checked: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, checked: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, checked: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, checked: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, checked: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })
  const weekDays = getWeekDays()

  const { fields } = useFieldArray({
    name: 'intervals',
    control,
  })

  const router = useRouter()

  const intervals = watch('intervals')

  async function handleSetInterval(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput

    console.log('false', intervals)
    await api.post('/users/time-intervals', { intervals })

    await router.push('/register/update-profile')
  }
  return (
    <Container>
      <Header>
        <Heading as="strong">Quase lá!</Heading>
        <Text>
          Defina o intervalo de horários que você está disponivel em cada dia da
          semana.
        </Text>
        <MultiStep size={4} currentStep={3} />
      </Header>
      <IntervalBox as="form" onSubmit={handleSubmit(handleSetInterval)}>
        <IntervalsContainer>
          {fields?.map((item, index) => {
            return (
              <IntervalItem key={item.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.checked`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Checkbox
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          checked={field.value}
                        />
                      )
                    }}
                  />
                  <Text>{weekDays[item.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    {...register(`intervals.${index}.startTime`)}
                    disabled={intervals[index].checked === false}
                  />
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    {...register(`intervals.${index}.endTime`)}
                    disabled={intervals[index].checked === false}
                  />
                </IntervalInputs>
              </IntervalItem>
            )
          })}
        </IntervalsContainer>
        {errors.intervals && <FormError>{errors.intervals.message}</FormError>}
        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  )
}
