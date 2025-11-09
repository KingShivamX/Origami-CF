"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Loader, Users, Target } from "lucide-react";

interface MigrationResult {
  totalUsers: number;
  totalTrainings: number;
  usersUpdated: number;
  trainingsProcessed: number;
  errors: string[];
  ratingChanges: {
    userId: string;
    handle: string;
    oldRating: number;
    newRating: number;
    delta: number;
    trainingsCount: number;
  }[];
}

interface PreviewData {
  usersToUpdate: number;
  totalTrainings: number;
  estimatedChanges: {
    handle: string;
    currentRating: number;
    estimatedNewRating: number;
    trainingsCount: number;
  }[];
}

export default function MigrateRatingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/migrate-ratings");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch preview");
      }
      
      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm("⚠️ This will recalculate ALL user ratings based on historical contests. This action cannot be undone. Are you sure?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMigrationResult(null);
    
    try {
      const response = await fetch("/api/admin/migrate-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: true }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Migration failed");
      }
      
      setMigrationResult(data.result);
      setPreview(null); // Clear preview after migration
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating < 1200) return "text-gray-600";
    if (rating < 1400) return "text-green-600";
    if (rating < 1600) return "text-cyan-600";
    if (rating < 1900) return "text-blue-600";
    if (rating < 2100) return "text-violet-600";
    if (rating < 2300) return "text-orange-600";
    return "text-red-600";
  };

  const formatDelta = (delta: number) => {
    if (delta === 0) return "±0";
    return delta > 0 ? `+${delta}` : `${delta}`;
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Rating Migration Tool</h1>
          <p className="text-muted-foreground">
            Recalculate all historical contest ratings using the new mathematical formula
          </p>
        </div>

        {/* Warning */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Important Notice</h3>
                <p className="text-sm text-orange-700 mt-1">
                  This migration will recalculate ALL user ratings from scratch using the new formula. 
                  Make sure to backup your database before running this operation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={fetchPreview} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            Preview Changes
          </Button>
          
          <Button 
            onClick={runMigration} 
            disabled={isLoading || !preview}
            variant="destructive"
          >
            {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            Run Migration
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Results */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Migration Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{preview.usersToUpdate}</div>
                  <div className="text-sm text-muted-foreground">Users to Update</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{preview.totalTrainings}</div>
                  <div className="text-sm text-muted-foreground">Total Contests</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{preview.estimatedChanges.length}</div>
                  <div className="text-sm text-muted-foreground">Sample Users</div>
                </div>
              </div>

              {/* Sample Changes */}
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Rating Changes (First 10 Users):</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {preview.estimatedChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <span className="font-mono text-sm">{change.handle}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getRatingColor(change.currentRating)}`}>
                          {change.currentRating}
                        </span>
                        <span>→</span>
                        <span className={`text-sm ${getRatingColor(change.estimatedNewRating)}`}>
                          {change.estimatedNewRating}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDelta(change.estimatedNewRating - change.currentRating)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({change.trainingsCount} contests)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Migration Results */}
        {migrationResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Migration Completed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-green-700">{migrationResult.usersUpdated}</div>
                  <div className="text-xs text-green-600">Users Updated</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-green-700">{migrationResult.trainingsProcessed}</div>
                  <div className="text-xs text-green-600">Contests Processed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-green-700">{migrationResult.totalTrainings}</div>
                  <div className="text-xs text-green-600">Total Contests</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-red-600">{migrationResult.errors.length}</div>
                  <div className="text-xs text-red-500">Errors</div>
                </div>
              </div>

              {/* Rating Changes Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800">Rating Changes:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {migrationResult.ratingChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                      <span className="font-mono">{change.handle}</span>
                      <div className="flex items-center gap-2">
                        <span className={getRatingColor(change.oldRating)}>
                          {change.oldRating}
                        </span>
                        <span>→</span>
                        <span className={getRatingColor(change.newRating)}>
                          {change.newRating}
                        </span>
                        <Badge 
                          variant={change.delta >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {change.delta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {formatDelta(change.delta)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({change.trainingsCount})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {migrationResult.errors.length > 0 && (
                <details className="space-y-2">
                  <summary className="font-semibold text-red-600 cursor-pointer">
                    Errors ({migrationResult.errors.length})
                  </summary>
                  <div className="bg-red-100 p-3 rounded text-sm space-y-1">
                    {migrationResult.errors.map((error, index) => (
                      <div key={index} className="text-red-700">{error}</div>
                    ))}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
