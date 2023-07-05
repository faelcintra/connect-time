import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { Container, Form, FormError, Header } from './styles'
import { useForm } from 'react-hook-form'

import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/src/lib/axios'
import { AxiosError } from 'axios'

const userRegisterSchema = zod.object({
  username: zod
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens.',
    })
    .transform((username) => username.toLocaleLowerCase()),
  name: zod
    .string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 letras.' }),
})

type userType = zod.infer<typeof userRegisterSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<userType>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { username: 'faelc' },
  })

  const router = useRouter()

  async function handleRegister(data: userType) {
    const { name, username } = data

    try {
      await api.post(`/users`, {
        username,
        name,
      })

      setTimeout(async () => {
        await router.push('/register/connect-calendar')
      }, 500)
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
      }
      console.log(err)
    }
  }

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo a Connect Time!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>
        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            placeholder="seu-usuario"
            prefix="connect.com/"
            {...register('username')}
          />
          {errors.username && (
            <FormError size={'sm'}>{errors.username.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register('name')} />
          {errors.name && (
            <FormError size={'sm'}>{errors.name.message}</FormError>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
        </Button>
      </Form>
    </Container>
  )
}
