import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Building2, CheckCircle, Calendar, FileText, LogOut, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState(null);

  // Mock Salesforce data - we'll replace this with real data later
  const [applicationData] = useState({
    status: 'Initial Screening', // This will come from Salesforce
    screeningStatus: {
      questionnaireCompleted: false,
      questionnaireGraded: false
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Define track steps with substeps
  const trackSteps = [
    { 
      id: 1, 
      name: "Initial Screening", 
      type: "form", 
      status: applicationData.status === 'Initial Screening' ? 'in-progress' : 'completed',
      icon: FileText,
      description: "Application submission and initial review",
      substeps: [
        {
          id: '1a',
          name: 'Complete Application',
          status: 'completed', // Always completed since we don't send invitations until after application
          description: 'Submit your initial application'
        },
        {
          id: '1b', 
          name: 'Questionnaire',
          status: applicationData.screeningStatus.questionnaireCompleted 
            ? (applicationData.screeningStatus.questionnaireGraded ? 'completed' : 'pending')
            : 'todo',
          description: applicationData.screeningStatus.questionnaireCompleted 
            ? (applicationData.screeningStatus.questionnaireGraded 
                ? 'Questionnaire completed and reviewed'
                : 'We are reviewing your questionnaire responses')
            : 'Complete the screening questionnaire so you can schedule an interview'
        }
      ]
    },
    { 
      id: 2, 
      name: "Interview", 
      type: "calendly", 
      status: applicationData.status === 'Interview' ? 'in-progress' : 'pending',
      icon: Calendar,
      description: "Schedule and complete your interview",
      substeps: [
        {
          id: '2a',
          name: 'Schedule Interview',
          status: 'pending',
          description: 'Book your interview time slot'
        },
        {
          id: '2b',
          name: 'Complete Interview',
          status: 'pending', 
          description: 'Attend your scheduled interview'
        }
      ]
    },
    { 
      id: 3, 
      name: "Application Review", 
      type: "manual", 
      status: 'pending',
      icon: CheckCircle,
      description: "Final review and decision",
      substeps: [
        {
          id: '3a',
          name: 'Final Review',
          status: 'pending',
          description: 'Team reviews your complete application'
        },
        {
          id: '3b',
          name: 'Decision',
          status: 'pending',
          description: 'Receive your application decision'
        }
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleStepExpansion = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const getProgressPercentage = () => {
    const allSubsteps = trackSteps.flatMap(step => step.substeps);
    const completedSubsteps = allSubsteps.filter(substep => substep.status === 'completed').length;
    return Math.round((completedSubsteps / allSubsteps.length) * 100);
  };

  const getCurrentStep = () => {
    // Find the current top-level step
    const currentTopStep = trackSteps.find(step => step.status === 'in-progress');
    if (!currentTopStep) return null;

    // Find incomplete substeps within the current step
    const incompleteSubsteps = currentTopStep.substeps.filter(substep => 
      substep.status === 'todo' || substep.status === 'pending'
    );

    return {
      topStep: currentTopStep,
      incompleteSubsteps
    };
  };

  const handleQuestionnaireClick = () => {
    // TODO: Replace with actual Formstack URL with user's contact ID
    const formstackUrl = `https://propelamerica.formstack.com/forms/screening_questionnaire?contact_id=${userData?.contactId || 'test'}`;
    window.open(formstackUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header - keep the same */}
       <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Propel America Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {userData?.contactName || user.displayName || 'Applicant'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Track Progress */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Propel Onboarding Track</h3>
                    <p className="text-gray-600">
                      Applicant: {userData?.contactName || user.displayName || user.email}
                    </p>
                    {userData?.contactId && (
                      <p className="text-sm text-gray-500">ID: {userData.contactId}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {trackSteps.map((step) => {
                    const Icon = step.icon;
                    const isExpanded = expandedStep === step.id;
                    
                    return (
                      <div key={step.id} className="border rounded-lg overflow-hidden">
                        {/* Main Step */}
                        <div
                          onClick={() => toggleStepExpansion(step.id)}
                          className={`flex items-center space-x-4 p-4 cursor-pointer transition-all ${
                            step.status === 'completed' 
                              ? 'bg-green-50 border-green-200' 
                              : step.status === 'in-progress' 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : step.status === 'in-progress' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{step.name}</div>
                            <div className="text-sm text-gray-500">{step.description}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              step.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : step.status === 'in-progress' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {step.status === 'completed' 
                                ? 'Complete' 
                                : step.status === 'in-progress' 
                                ? 'In Progress' 
                                : 'Pending'
                              }
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Substeps */}
                        {isExpanded && (
                          <div className="bg-white border-t">
                            {step.substeps.map((substep) => (
                              <div key={substep.id} className="flex items-center space-x-4 p-4 pl-16 border-b last:border-b-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  substep.status === 'completed' 
                                    ? 'bg-green-500 text-white' 
                                    : substep.status === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : substep.status === 'todo'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {substep.status === 'completed' ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : substep.status === 'pending' ? (
                                    '⏳'
                                  ) : substep.status === 'todo' ? (
                                    '!'
                                  ) : (
                                    '○'
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{substep.name}</div>
                                  <div className="text-xs text-gray-500">{substep.description}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  substep.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : substep.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : substep.status === 'todo'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {substep.status === 'completed' 
                                    ? 'Complete' 
                                    : substep.status === 'pending'
                                    ? 'Under Review'
                                    : substep.status === 'todo'
                                    ? 'To Do'
                                    : 'Pending'
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Step Details */}
              <div className="lg:w-80">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Current Step</h4>
                  {currentStep ? (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <currentStep.topStep.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="font-medium text-gray-900">{currentStep.topStep.name}</div>
                      </div>
                      
                      {currentStep.incompleteSubsteps.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700">Next Actions:</div>
                          {currentStep.incompleteSubsteps.map((substep) => (
                            <div key={substep.id} className="border rounded-lg p-3 bg-white">
                              <div className="font-medium text-sm text-gray-900 mb-1">{substep.name}</div>
                              <div className="text-xs text-gray-600 mb-3">{substep.description}</div>
                              
                              {substep.id === '1b' && substep.status === 'todo' && (
                                <button
                                  onClick={handleQuestionnaireClick}
                                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                >
                                  <span>Complete Questionnaire</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                              
                              {substep.status === 'pending' && (
                                <div className="flex items-center space-x-2 text-xs text-yellow-700">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>Under review</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">All steps complete!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}