import Head from 'next/head'
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/core'
import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import useAuth from './_useAuth'
import PageLoader from './_components/PageLoader'
import { useRouter } from 'next/router'

export default function Home() {
  const {
    verify,
    isVerifying,
    isVerified,
    verificationFailed,
    isLoading,
  } = useAuth()
  const router = useRouter()

  const { getFieldProps, handleSubmit } = useFormik({
    initialValues: { secret: '' },
    onSubmit: async (formValues) => {
      await verify(formValues.secret)
    },
  })

  useEffect(() => {
    if (isVerified) {
      router.push('/panel')
    }
  }, [isVerified])

  return (
    <>
      <Head>
        <title>FutureFlags</title>
      </Head>

      {isLoading && <PageLoader />}

      {!isLoading && !isVerified && (
        <Box as="main" padding={[4, 6]} maxW="sm" marginX="auto">
          <Box rounded="md" borderWidth={1} padding={8}>
            <Text fontSize="2xl" marginBottom={4}>
              Dashboard access
            </Text>

            <form onSubmit={handleSubmit}>
              <FormControl marginBottom={4}>
                <FormLabel htmlFor="secret">Admin secret</FormLabel>
                <Input
                  {...getFieldProps('secret')}
                  autoFocus
                  isRequired
                  type="password"
                  id="secret"
                />
              </FormControl>

              <Button
                isLoading={isVerifying}
                type="submit"
                variantColor="teal"
                width="full"
              >
                Access dashboard
              </Button>
            </form>
          </Box>

          {verificationFailed ? (
            <Alert status="warning" rounded="md" marginY={4}>
              <AlertIcon maxWidth={4} />
              <Box fontSize="sm">
                <AlertTitle>Secret is not valid!</AlertTitle>
                <AlertDescription>
                  Please check your secret and try again.
                </AlertDescription>
              </Box>
            </Alert>
          ) : null}
        </Box>
      )}
    </>
  )
}
