import { Button, Text, TextInput } from '@ignite-ui/react'
import { Form, FormInfo } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useRouter } from 'next/router'

const usernameFormSchema = zod.object({
  username: zod
    .string()
    .min(3, { message: 'É necessario ter pelo menos 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens.',
    })
    .transform((username) => username.toLocaleLowerCase()),
})

type usernameFormType = zod.infer<typeof usernameFormSchema>

export function UsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<usernameFormType>({
    resolver: zodResolver(usernameFormSchema),
  })

  const router = useRouter()

  async function handleUserForm(data: usernameFormType) {
    console.log(data.username)
    const { username } = data
    await router.push(`/register?username=${username}`)
  }
  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleUserForm)}>
        <TextInput
          size="sm"
          prefix="connect.com/"
          placeholder="seu-usuario"
          {...register('username')}
        />

        <Button size="sm" type="submit" disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>

      <FormInfo>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : 'Digite o nome de usuário. '}
        </Text>
      </FormInfo>
    </>
  )
}
