import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface FormData {
  displayName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.user_metadata?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Nome não pode estar vazio';
    }

    // If changing password, validate all password fields
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Senha atual é obrigatória';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Nova senha é obrigatória';
      } else {
        // Password strength validation
        if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
          newErrors.newPassword = 'Nova senha deve conter letras maiúsculas, minúsculas e números';
        }
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha não confere';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateDisplayName = async (name: string) => {
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: name }
      });

      if (authError) throw authError;

      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ name: name })
        .eq('id', user?.id);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating display name:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        return { success: false, error: 'Senha atual incorreta' };
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Erro ao atualizar senha. Tente novamente.' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      let nameUpdated = false;
      let passwordUpdated = false;

      // Update display name if changed
      if (formData.displayName !== (user?.user_metadata?.name || '')) {
        const result = await updateDisplayName(formData.displayName);
        if (!result.success) {
          setErrors({ general: result.error });
          return;
        }
        nameUpdated = true;
      }

      // Update password if provided
      if (formData.newPassword) {
        const result = await updatePassword(formData.currentPassword, formData.newPassword);
        if (!result.success) {
          setErrors({ general: result.error });
          return;
        }
        passwordUpdated = true;
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      // Show success message
      if (nameUpdated && passwordUpdated) {
        setSuccess('Nome e senha atualizados com sucesso!');
      } else if (nameUpdated) {
        setSuccess('Nome atualizado com sucesso!');
      } else if (passwordUpdated) {
        setSuccess('Senha atualizada com sucesso!');
      }

    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400">Gerencie suas preferências e conta</p>
          </div>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-medium">{success}</p>
            </div>
          </motion.div>
        )}

        {/* General Error */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-medium">{errors.general}</p>
            </div>
          </motion.div>
        )}

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Informações do Perfil</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div>
                <Input
                  label="Nome de Exibição"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  error={errors.displayName}
                  placeholder="Seu nome"
                  disabled={loading}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-700/50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Password Section */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-white">Alterar Senha</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Password */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Input
                        label="Senha Atual"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        error={errors.currentPassword}
                        placeholder="Digite sua senha atual"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <div className="relative">
                      <Input
                        label="Nova Senha"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        error={errors.newPassword}
                        placeholder="Digite sua nova senha"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <Input
                        label="Confirmar Nova Senha"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                        placeholder="Confirme sua nova senha"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-slate-500">
                    A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Sobre o MathFly</h2>
            <div className="text-slate-400 space-y-2">
              <p>Versão: 1.0.0</p>
              <p>Desenvolvido com React, TypeScript e Supabase</p>
              <p>© 2024 MathFly - Plataforma Educacional Gamificada</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}