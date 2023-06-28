import { assign100AllForumsAndTasksUsers } from "./scripts/assign100AllForumsAndTaskUsers";
import { assignCoursesToUser } from "./scripts/assignCoursesToUsers";
import { deleteProgressLpsInstancePerCourse } from "./scripts/deleteProgressLpsInstancePerCourse";
import { downloadCertificatesPerInstance } from "./scripts/donwloadCertificatesPerInstance";
import { downloadDC3CertificatesForAnInstance } from "./scripts/downloadDC3Certificates";
import { generateCoursesListPerInstance } from "./scripts/generateCoursesListPerInstance";
import { getAllReviewsForAnInstance } from "./scripts/getAllReviewsForAnInstance";
import { getReportCoursesNeo } from "./scripts/getReportCoursesNeo";
import { insertNewCompetencies } from "./scripts/insertNewCompetencies";
import { migrateCoursesToContentPerInstance } from "./scripts/migrateCoursesToContentPerInstance";
import { setAsInstructorPerInstance } from "./scripts/setAsInstructorPerInstance";
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
// downloadCertificatesPerInstance("azelis");
// generateExcel()
// downloadDC3CertificatesForAnInstance("solintegra");
// migrateCoursesToContentPerInstance("tecmilenio");
// setAsInstructorPerInstance("universidadeacero")
// generateCoursesListPerInstance('universidadexecon')
// insertNewCompetencies();
// getReportCoursesNeo("centrovirtualfa")
assignCoursesToUser("tecmilenio");
