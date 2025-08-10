import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '@/lib/localdb';

interface AuthGateProps {
  onSuccess?: () => void;
}

export default function AuthGate({ onSuccess }: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    try {
      if (!identifier || !password) throw new Error('Заполните все поля');
      loginUser(identifier.trim(), password);
      toast({ title: 'Успех', description: 'Вы вошли в систему' });
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Ошибка входа', description: e.message ?? 'Попробуйте снова' });
    }
  };

  const handleRegister = () => {
    try {
      if (!email || !username || !password || !confirm) throw new Error('Заполните все поля');
      if (password !== confirm) throw new Error('Пароли не совпадают');
      registerUser(email.trim(), username.trim(), password);
      toast({ title: 'Аккаунт создан', description: 'Вы вошли в систему' });
      onSuccess?.();
    } catch (e: any) {
      toast({ title: 'Ошибка регистрации', description: e.message ?? 'Попробуйте снова' });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold">Ф-Банк</h1>
        <p className="text-sm text-muted-foreground">Создайте аккаунт и войдите, чтобы пользоваться переводами</p>
        <link rel="canonical" href="/bank" />
      </header>

      <Card className="glass p-5 space-y-4">
        {mode === 'login' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm">Почта или юзернейм</label>
              <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="email@site.com или username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Пароль</label>
              <div className="flex gap-2">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" />
                <Button variant="outline" onClick={() => setShowPass(s => !s)} aria-label="Показать пароль">
                  {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={handleLogin}>
              <LogIn className="h-4 w-4 mr-2"/> Войти
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Нет аккаунта? <button className="underline" onClick={() => setMode('register')}>Зарегистрироваться</button>
            </p>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm">Почта</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@site.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Юзернейм</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Пароль</label>
              <div className="flex gap-2">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" />
                <Button variant="outline" onClick={() => setShowPass(s => !s)} aria-label="Показать пароль">
                  {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Повторите пароль</label>
              <Input type={showPass ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Повторите пароль" />
            </div>
            <Button className="w-full" onClick={handleRegister}>
              <UserPlus className="h-4 w-4 mr-2"/> Зарегистрироваться
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Уже есть аккаунт? <button className="underline" onClick={() => setMode('login')}>Войти</button>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
