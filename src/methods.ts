import { assignMPCoursesToAnInstance } from "./scripts/assignMPCoursesToAnInstance";
import { deleteProgressLpsInstancePerCourse } from "./scripts/deleteProgressLpsInstancePerCourse";
import { downloadCertificatesPerInstance } from "./scripts/downloadCertificatesPerInstance";
import { downloadDC3CertificatesForAnInstance } from "./scripts/downloadDC3Certificates";
import { downloadEvaluationsPerInstance } from "./scripts/downloadEvaluationsPerInstance";
import { extractContentPerInstance } from "./scripts/extractContentPerInstance";
import { generateCoursesListPerInstance } from "./scripts/generateCoursesListPerInstance";
import { generateReportLpsPerInstance } from "./scripts/generateReportLpsPerInstance";
import { getAllReviewsForAnInstance } from "./scripts/getAllReviewsForAnInstance";
import { getReportCoursesNeo } from "./scripts/getReportCoursesNeo";
import { identifyUsersInOtherInstances } from "./scripts/identifyUsersInOtherInstances";
import { insertNewCompetencies } from "./scripts/insertNewCompetencies";
import { migrateCoursesToContentPerInstance } from "./scripts/migrateCoursesToContentPerInstance";
import { migrateRubrics } from "./scripts/migrateRubrics";
import { removeInstructor } from "./scripts/removeInstructor";
import { replaceInstructorByOther } from "./scripts/replaceInstructorByOther";
import { setAsInstructorPerInstance } from "./scripts/setAsInstructorPerInstance";
import { syncCoursesTecMilenio } from "./scripts/syncCoursesTecmilenioInMP";
import { syncUsers } from "./scripts/syncUsers";
import { syncUsersByExcel } from "./scripts/syncUsersByExcel";

// generateExcelWithLogsPerInstance()
// getAllReviewsForAnInstance('mazda')
// generateExcelForAllResourcesPerInstance()
// assign100AllForumsAndTasksUsers();
// deleteProgressLpsInstancePerCourse()
// deleteCommentsForEnireInstance()
// syncQuestionsForOneLesson()
// syncUsers()
// syncUsersByExcel();
// generateExcel()
// setAsInstructorPerInstance("uinterceramic");
// generateCoursesListPerInstance('universidadexecon')
// insertNewCompetencies();
// getReportCoursesNeo("centrovirtualfa")
// assignCoursesToUser("tecmilenio");
// identifyUsersInOtherInstances()
// assignMPCoursesToAnInstance("demo")
// migrateRubrics();
// extractContentPerInstance('rotoplas')

// removeInstructor("uinterceramic");
// replaceInstructorByOther(
//   "azelis",
//   "V5rPJQek4AdSWsmr7rMPel3yuBO2",
//   "qIVhJSwm75ccKdWT48dyzE6FUCA2",
//   "32tqVLQv9VfbKZAE8KjaVbG733W2",
// );
// downloadEvaluationsPerInstance("azelis");


// downloadCertificatesPerInstance("azelis");
// downloadDC3CertificatesForAnInstance("azelis")
// migrateCoursesToContentPerInstance("tecmilenio");
// syncCoursesTecMilenio('tecmilenio')
generateReportLpsPerInstance("mazda")
