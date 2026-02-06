import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminPayments } from "@/hooks/use-admin";
import { Loader2, CreditCard, ArrowUpCircle } from "lucide-react";

export default function AdminPayments() {
  const { data, isLoading } = useAdminPayments();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const purchases = data?.purchases || [];
  const surplus = data?.surplus || [];

  return (
    <div className="space-y-6" data-testid="admin-payments">
      <h2 className="text-2xl font-bold">Paiements</h2>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <CardTitle>Achats ({purchases.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Utilisateur</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Article</th>
                  <th className="text-left p-3 font-medium">Prix</th>
                  <th className="text-left p-3 font-medium">Statut</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p: any) => (
                  <tr key={p.id} className="border-b" data-testid={`row-purchase-${p.id}`}>
                    <td className="p-3">{p.userName || p.userEmail || p.userId}</td>
                    <td className="p-3"><Badge variant="secondary">{p.itemType}</Badge></td>
                    <td className="p-3">{p.itemKey}</td>
                    <td className="p-3 font-medium">{(p.price / 100).toFixed(2)} &euro;</td>
                    <td className="p-3">
                      <Badge variant={p.status === "active" ? "default" : "outline"}>{p.status}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucun achat</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-primary" />
          <CardTitle>Surplus ({surplus.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Utilisateur</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Quantité</th>
                  <th className="text-left p-3 font-medium">Prix</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {surplus.map((s: any) => (
                  <tr key={s.id} className="border-b" data-testid={`row-surplus-${s.id}`}>
                    <td className="p-3">{s.userName || s.userEmail || s.userId}</td>
                    <td className="p-3"><Badge variant="secondary">{s.surplusType}</Badge></td>
                    <td className="p-3">+{s.amount}</td>
                    <td className="p-3 font-medium">{(s.price / 100).toFixed(2)} &euro;</td>
                    <td className="p-3 text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                  </tr>
                ))}
                {surplus.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun surplus</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
