import Header from "@/components/Header";
import LoginPageBody from "@/components/Login/Body";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      
      <Header activePage="login" onPageChange={() => {}} />
      <LoginPageBody />
    </>
  );
}
