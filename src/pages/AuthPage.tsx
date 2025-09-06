import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

const logo = 'https://i.postimg.cc/YSJChsxt/math-Fly-logo.png';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div 
            className="inline-flex items-center justify-center w-64 h-64 logo"
            style={{ margin: '-50px 0' }}
          >
            <img 
              src={logo}
              alt="MathFly Logo" 
              className="w-full h-full object-contain opacity-90"
            />
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}