import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ethers } from 'ethers';

type ProviderRpcError = {
  code: number;
  message: string;
  data?: unknown;
} & Error;

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '../config/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert";

// RLUSD Token Contract ABI (minimal interface for balance checking)
const RLUSD_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const RLUSD_PROXY_ADDRESS = "0xe101FB315a64cDa9944E570a7bFfaFE60b994b1D";
const INFURA_RPC = "https://sepolia.infura.io/v3/fd73aefc37bf45e59812343008be7f9a";

const formSchema = z.object({
  accountTypes: z.array(z.string()).min(1, "Select at least one account type"),
  mealBlocksLeft: z.number().nonnegative().optional(),
  diningDollarsLeft: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Onboard = () => {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountTypes: [],
      mealBlocksLeft: 0,
      diningDollarsLeft: 0,
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      // Check if user is already onboarded
      const { data: userData } = await supabase
        .from('public_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        navigate('/');
        return;
      }

      setSession(session);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const connectWallet = async () => {
    // Check specifically for MetaMask
    if (!window.ethereum?.isMetaMask) {
      setError("Please install MetaMask to connect a wallet.");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Request account access specifically from MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Check if we're on Sepolia
      const network = await provider.getNetwork();
      const sepoliaChainId = '0xaa36a7';
      
      if (network.chainId !== parseInt(sepoliaChainId, 16)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (error) {
          const switchError = error as ProviderRpcError;
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'SepoliaETH',
                    decimals: 18
                  },
                  rpcUrls: [INFURA_RPC],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
            } catch (addError) {
              const providerError = addError as ProviderRpcError;
              console.error('Error adding Sepolia network:', providerError.message);
              setError('Failed to add Sepolia network. Please try again.');
              return;
            }
          } else {
            console.error('Error switching to Sepolia network:', switchError.message);
            setError('Failed to switch network. Please try again.');
            return;
          }
        }
      }

      // Get RLUSD balance using the signer
      const rlusdContract = new ethers.Contract(
        RLUSD_PROXY_ADDRESS,
        RLUSD_ABI,
        signer
      );
      
      const balance = await rlusdContract.balanceOf(address);
      setWalletBalance(ethers.utils.formatUnits(balance, 18));

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const updateAccountType = (type: string, checked: boolean) => {
    const currentTypes = form.getValues().accountTypes;
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    form.setValue('accountTypes', newTypes, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    if (!session?.user) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('public_users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          account_type: data.accountTypes.includes('both') ? 'both' : data.accountTypes[0],
          university: 'Carnegie Mellon University',
          is_verified: false,
          is_active: true,
          full_name: session.user.user_metadata?.full_name || ''
        });

      if (profileError) throw profileError;

      // Create wallet and reputation records for all users
      await Promise.all([
        supabase
          .from('user_wallets')
          .upsert({
            user_id: session.user.id,
            balance: 0,
            xrpl_address: walletAddress || '' // Store wallet if connected, empty string if not
          }),
        supabase
          .from('user_reputation')
          .upsert({
            user_id: session.user.id,
            rating: 0,
            total_orders: 0,
            successful_orders: 0,
            strikes: 0,
            is_banned: false
          })
      ]);

      navigate('/');
    } catch (err) {
      console.error('Error during onboarding:', err);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2].map((number) => (
              <div
                key={number}
                className={`h-2 flex-1 ${
                  number <= step ? "bg-primary" : "bg-muted"
                } ${number === 1 ? "rounded-l" : "rounded-r"}`}
              />
            ))}
          </div>
          <p className="text-sm text-center">
            Step {step} of 2
          </p>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl mb-6">Select Account Type</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="buyer"
                  checked={form.watch('accountTypes').includes('buyer')}
                  onCheckedChange={(checked) => updateAccountType('buyer', checked as boolean)}
                />
                <Label htmlFor="buyer">Buyer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="seller"
                  checked={form.watch('accountTypes').includes('seller')}
                  onCheckedChange={(checked) => updateAccountType('seller', checked as boolean)}
                />
                <Label htmlFor="seller">Seller</Label>
              </div>
              {form.formState.errors.accountTypes && (
                <p className="text-sm text-destructive">{form.formState.errors.accountTypes.message}</p>
              )}
            </div>
            <Button 
              className="w-full mt-6"
              onClick={() => {
                if (form.getValues().accountTypes.length > 0) {
                  setStep(2);
                }
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl mb-6">Account Details</h2>
              
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Crypto Wallet Connection (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  You can connect your crypto wallet now or later. A wallet will be required to make or fulfill orders.
                </p>
                {!walletAddress ? (
                  <Button 
                    type="button"
                    onClick={connectWallet}
                    variant="outline"
                    className="w-full"
                  >
                    Connect MetaMask
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    <p className="text-sm">
                      RLUSD Balance: {walletBalance}
                    </p>
                  </div>
                )}
              </div>
              
              {form.watch('accountTypes').includes('seller') && (
                <>
                  <FormField
                    control={form.control}
                    name="mealBlocksLeft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Blocks Left</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-white dark:bg-gray-950" // Added for better contrast
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diningDollarsLeft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dining Dollars Left</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-white dark:bg-gray-950" // Added for better contrast
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {form.watch('accountTypes').includes('buyer') && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Current Block Price</p>
                  <p className="text-2xl mt-2">$8.50</p>
                  <p className="text-sm mt-1">You need $RLUSD to make purchases.</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Onboard;